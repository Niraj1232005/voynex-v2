import {
  Injectable,
  ServiceUnavailableException,
  BadGatewayException,
  GatewayTimeoutException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FreeTimeCategory, SearchFreetimeDto } from './dto/search-freetime.dto';

export interface HubCandidate {
  name: string;
  formatted: string;
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}

export interface FreeTimePlace {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lon: number;
  straightLineMeters: number;
  outboundWalkMinutes: number | null;
  returnWalkMinutes: number | null;
  dwellMinutes: number;
  bufferMinutes: number;
  totalTripMinutes: number | null;
  fits: boolean;
  fitStatus: 'FITS' | 'DOES_NOT_FIT' | 'UNAVAILABLE';
  marginMinutes: number | null;
  mapDirectionsUrl: string;
}

export interface FreeTimeSearchResult {
  hub: {
    name: string;
    lat: number;
    lon: number;
  };
  freeTimeMinutes: number;
  dwellMinutes: number;
  bufferMinutes: number;
  category: FreeTimeCategory;
  places: FreeTimePlace[];
  providerCostFormula: string;
  disclaimer: string;
  attribution: {
    osmText: string;
    osmUrl: string;
    geoapifyText: string;
    geoapifyUrl: string;
  };
}

const CATEGORY_MAP: Record<FreeTimeCategory, string> = {
  food: 'catering.restaurant,catering.cafe,catering.fast_food,catering.food_court,catering.pub,catering.bar',
  rest: 'catering.cafe,leisure.park,natural.park,leisure.garden',
  shopping:
    'commercial.shopping_mall,commercial.supermarket,commercial.marketplace,commercial.convenience,commercial.chemist,commercial.bookshop',
  sightseeing:
    'tourism.attraction,tourism.museum,entertainment.culture,tourism.gallery,entertainment.aquarium,natural.park,tourism.artwork',
};

const DISCLAIMER_TEXT =
  'Travel-time estimates are for general guidance only and assume an average walking pace under normal conditions. They do not account for airport or station terminal layout, gate distances, security checkpoints, passport control, luggage retrieval, platform navigation, terrain, construction, weather, or personal walking speed. Buffers are customizable planning allowances, not safety guarantees. VOYNEX assumes no liability for missed flights, missed trains, or unexpected delays. Always prioritize your departure schedule.';

@Injectable()
export class FreetimeService {
  private readonly logger = new Logger(FreetimeService.name);

  constructor(private readonly configService: ConfigService) {}

  private getApiKey(): string {
    let key =
      this.configService.get<string>('GEOAPIFY_API_KEY') ||
      process.env.GEOAPIFY_API_KEY;
    if (!key || key.trim() === '') {
      throw new ServiceUnavailableException(
        'Geoapify API key is not configured on the server',
      );
    }
    key = key.trim();
    // If the full example URL was pasted (e.g. https://...?apiKey=KEY), extract the token
    if (key.includes('apiKey=')) {
      const match = key.match(/apiKey=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        key = match[1];
      }
    }
    // Remove accidental quotes
    key = key.replace(/['"]/g, '').trim();
    return key;
  }

  async autocompleteHub(text: string): Promise<HubCandidate[]> {
    const apiKey = this.getApiKey();
    const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete');
    url.searchParams.set('text', text);
    url.searchParams.set('limit', '5');
    url.searchParams.set('format', 'json');
    url.searchParams.set('apiKey', apiKey);

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(6000),
      });
    } catch (err: any) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        throw new GatewayTimeoutException(
          'Geocoding provider timed out while looking up locations',
        );
      }
      this.logger.error(`Network error reaching Geoapify: ${err.message}`);
      throw new BadGatewayException(
        'Failed to connect to geocoding provider',
      );
    }

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new BadGatewayException(
          'Geocoding provider authentication or quota exceeded',
        );
      }
      if (res.status === 429) {
        throw new BadGatewayException(
          'Geocoding provider rate limit exceeded',
        );
      }
      throw new BadGatewayException(
        `Geocoding provider returned error status: ${res.status}`,
      );
    }

    let data: any;
    try {
      data = await res.json();
    } catch {
      throw new BadGatewayException(
        'Invalid JSON response received from geocoding provider',
      );
    }

    const rawList: any[] = Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.features)
        ? data.features.map((f: any) => ({
            ...f.properties,
            lat: f.properties?.lat ?? f.geometry?.coordinates?.[1],
            lon: f.properties?.lon ?? f.geometry?.coordinates?.[0],
          }))
        : [];

    return rawList
      .filter((item) => {
        if (
          item.lat === null ||
          item.lat === undefined ||
          item.lon === null ||
          item.lon === undefined ||
          item.lat === '' ||
          item.lon === ''
        ) {
          return false;
        }
        const lat = Number(item.lat);
        const lon = Number(item.lon);
        return (
          !isNaN(lat) &&
          !isNaN(lon) &&
          lat >= -90 &&
          lat <= 90 &&
          lon >= -180 &&
          lon <= 180
        );
      })
      .slice(0, 5)
      .map((item) => ({
        name: item.name || item.formatted || 'Unknown Location',
        formatted: item.formatted || item.name || '',
        lat: Number(item.lat),
        lon: Number(item.lon),
        city: item.city || item.county || undefined,
        country: item.country || undefined,
      }));
  }

  async searchNearby(dto: SearchFreetimeDto): Promise<FreeTimeSearchResult> {
    const apiKey = this.getApiKey();
    const categories = CATEGORY_MAP[dto.category] || CATEGORY_MAP.food;

    // Walking radius: calculate conservative distance based on available time
    // Max walk time one-way is at most freeTime / 2, capped at 3000m (~35 min walk)
    const maxOneWayMinutes = Math.max(10, Math.floor(dto.freeTimeMinutes / 3));
    const calculatedRadius = Math.min(3000, Math.max(800, maxOneWayMinutes * 80));

    const placesUrl = new URL('https://api.geoapify.com/v2/places');
    placesUrl.searchParams.set('categories', categories);
    placesUrl.searchParams.set(
      'filter',
      `circle:${dto.lon},${dto.lat},${calculatedRadius}`,
    );
    placesUrl.searchParams.set('bias', `proximity:${dto.lon},${dto.lat}`);
    placesUrl.searchParams.set('limit', '10');
    placesUrl.searchParams.set('apiKey', apiKey);

    let placesRes: Response;
    try {
      placesRes = await fetch(placesUrl.toString(), {
        signal: AbortSignal.timeout(7000),
      });
    } catch (err: any) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        throw new GatewayTimeoutException(
          'Places provider timed out while searching nearby spots',
        );
      }
      throw new BadGatewayException(
        'Failed to connect to places provider',
      );
    }

    if (!placesRes.ok) {
      if (placesRes.status === 401 || placesRes.status === 403) {
        throw new BadGatewayException(
          'Places provider authentication or quota exceeded',
        );
      }
      if (placesRes.status === 429) {
        throw new BadGatewayException(
          'Places provider rate limit exceeded',
        );
      }
      throw new BadGatewayException(
        `Places provider returned status: ${placesRes.status}`,
      );
    }

    let placesData: any;
    try {
      placesData = await placesRes.json();
    } catch {
      throw new BadGatewayException(
        'Invalid JSON received from places provider',
      );
    }

    const rawFeatures: any[] = Array.isArray(placesData?.features)
      ? placesData.features
      : [];

    // Extract valid place candidates
    const validPlaces = rawFeatures
      .map((f: any, idx: number) => {
        const props = f.properties || {};
        const coords = f.geometry?.coordinates || [];
        const lon = Number(props.lon ?? coords[0]);
        const lat = Number(props.lat ?? coords[1]);
        const straightLineMeters = Math.round(Number(props.distance ?? 0));

        return {
          id: props.place_id || `place_${idx}_${lat}_${lon}`,
          name: props.name || props.formatted || 'Unnamed place',
          category: props.categories?.[0] || dto.category,
          address: props.address_line2 || props.formatted || '',
          lat,
          lon,
          straightLineMeters: isNaN(straightLineMeters) ? 0 : straightLineMeters,
        };
      })
      .filter((p) => {
        return (
          !isNaN(p.lat) &&
          !isNaN(p.lon) &&
          p.lat >= -90 &&
          p.lat <= 90 &&
          p.lon >= -180 &&
          p.lon <= 180
        );
      })
      .slice(0, 10);

    // If no places found, return early without calling matrix API
    if (validPlaces.length === 0) {
      return {
        hub: {
          name: dto.hubName,
          lat: dto.lat,
          lon: dto.lon,
        },
        freeTimeMinutes: dto.freeTimeMinutes,
        dwellMinutes: dto.dwellMinutes,
        bufferMinutes: dto.bufferMinutes,
        category: dto.category,
        places: [],
        providerCostFormula:
          '1 credit (Places API) + 0 credits (Route Matrix skipped for 0 targets)',
        disclaimer: DISCLAIMER_TEXT,
        attribution: {
          osmText: '© OpenStreetMap contributors',
          osmUrl: 'https://www.openstreetmap.org/copyright',
          geoapifyText: 'Powered by Geoapify',
          geoapifyUrl: 'https://www.geoapify.com/',
        },
      };
    }

    // Call Route Matrix API for walking distances
    const matrixUrl = `https://api.geoapify.com/v1/routematrix?apiKey=${apiKey}`;
    const matrixBody = {
      mode: 'walk',
      sources: [{ location: [dto.lon, dto.lat] }],
      targets: validPlaces.map((p) => ({ location: [p.lon, p.lat] })),
    };

    let matrixData: any = null;
    try {
      const matrixRes = await fetch(matrixUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matrixBody),
        signal: AbortSignal.timeout(8000),
      });

      if (matrixRes.ok) {
        matrixData = await matrixRes.json();
      } else {
        this.logger.warn(
          `Route matrix API returned status ${matrixRes.status}; falling back to null routes`,
        );
      }
    } catch (err: any) {
      this.logger.warn(
        `Route matrix lookup failed or timed out: ${err.message}; continuing with unrouted places`,
      );
    }

    const row0 = Array.isArray(matrixData?.sources_to_targets?.[0])
      ? matrixData.sources_to_targets[0]
      : [];

    // Map each place with walking estimates and fit calculation
    const processedPlaces: FreeTimePlace[] = validPlaces.map((p, idx) => {
      const route = row0[idx];
      const timeSeconds =
        route && typeof route.time === 'number' && !isNaN(route.time)
          ? route.time
          : null;

      let outboundWalkMinutes: number | null = null;
      let returnWalkMinutes: number | null = null;
      let totalTripMinutes: number | null = null;
      let fits = false;
      let fitStatus: 'FITS' | 'DOES_NOT_FIT' | 'UNAVAILABLE' = 'UNAVAILABLE';
      let marginMinutes: number | null = null;

      if (timeSeconds !== null) {
        outboundWalkMinutes = Math.ceil(timeSeconds / 60);
        // Explicit estimate of return walk
        returnWalkMinutes = outboundWalkMinutes;
        totalTripMinutes =
          outboundWalkMinutes +
          dto.dwellMinutes +
          returnWalkMinutes +
          dto.bufferMinutes;

        fits = totalTripMinutes <= dto.freeTimeMinutes;
        fitStatus = fits ? 'FITS' : 'DOES_NOT_FIT';
        marginMinutes = dto.freeTimeMinutes - totalTripMinutes;
      }

      const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${dto.lat},${dto.lon}&destination=${p.lat},${p.lon}&travelmode=walking`;

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        address: p.address,
        lat: p.lat,
        lon: p.lon,
        straightLineMeters: p.straightLineMeters,
        outboundWalkMinutes,
        returnWalkMinutes,
        dwellMinutes: dto.dwellMinutes,
        bufferMinutes: dto.bufferMinutes,
        totalTripMinutes,
        fits,
        fitStatus,
        marginMinutes,
        mapDirectionsUrl,
      };
    });

    // Sorting:
    // 1. Places that fit come first, sorted by outboundWalkMinutes ascending.
    // 2. Places that don't fit, sorted by outboundWalkMinutes ascending.
    // 3. Unavailable routes at the very end.
    processedPlaces.sort((a, b) => {
      if (a.fitStatus === 'FITS' && b.fitStatus !== 'FITS') return -1;
      if (a.fitStatus !== 'FITS' && b.fitStatus === 'FITS') return 1;

      if (a.fitStatus === 'DOES_NOT_FIT' && b.fitStatus === 'UNAVAILABLE')
        return -1;
      if (a.fitStatus === 'UNAVAILABLE' && b.fitStatus === 'DOES_NOT_FIT')
        return 1;

      const aWalk = a.outboundWalkMinutes ?? 999999;
      const bWalk = b.outboundWalkMinutes ?? 999999;
      return aWalk - bWalk;
    });

    const matrixCost = Math.min(validPlaces.length, 10);
    const providerCostFormula = `1 credit (Places API) + ${matrixCost} credits (Route Matrix for ${validPlaces.length} targets) = ${1 + matrixCost} credits total`;

    return {
      hub: {
        name: dto.hubName,
        lat: dto.lat,
        lon: dto.lon,
      },
      freeTimeMinutes: dto.freeTimeMinutes,
      dwellMinutes: dto.dwellMinutes,
      bufferMinutes: dto.bufferMinutes,
      category: dto.category,
      places: processedPlaces,
      providerCostFormula,
      disclaimer: DISCLAIMER_TEXT,
      attribution: {
        osmText: '© OpenStreetMap contributors',
        osmUrl: 'https://www.openstreetmap.org/copyright',
        geoapifyText: 'Powered by Geoapify',
        geoapifyUrl: 'https://www.geoapify.com/',
      },
    };
  }
}
