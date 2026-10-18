import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FreetimeService } from './freetime.service';
import {
  ServiceUnavailableException,
  BadGatewayException,
  GatewayTimeoutException,
} from '@nestjs/common';
import { SearchFreetimeDto } from './dto/search-freetime.dto';

describe('FreetimeService', () => {
  let service: FreetimeService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FreetimeService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<FreetimeService>(FreetimeService);
    configService = module.get<ConfigService>(ConfigService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('autocompleteHub', () => {
    it('should throw ServiceUnavailableException if GEOAPIFY_API_KEY is missing', async () => {
      mockConfigService.get.mockReturnValue('');
      await expect(service.autocompleteHub('Heathrow')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('should parse and return valid hub candidates from Geoapify JSON results', async () => {
      mockConfigService.get.mockReturnValue('test-api-key');
      const mockApiResponse = {
        results: [
          {
            name: 'London Heathrow Airport',
            formatted: 'London Heathrow Airport, London, UK',
            lat: 51.47002,
            lon: -0.45429,
            city: 'London',
            country: 'United Kingdom',
          },
        ],
      };

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      } as Response);

      const results = await service.autocompleteHub('Heathrow');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('London Heathrow Airport');
      expect(results[0].lat).toBe(51.47002);
      expect(results[0].lon).toBe(-0.45429);
    });

    it('should filter out candidates with invalid coordinates', async () => {
      mockConfigService.get.mockReturnValue('test-api-key');
      const mockApiResponse = {
        results: [
          {
            name: 'Valid Hub',
            formatted: 'Valid Hub, City, Country',
            lat: 40.7128,
            lon: -74.006,
          },
          {
            name: 'Invalid Lat',
            formatted: 'Invalid Lat',
            lat: 150.0,
            lon: 10.0,
          },
          {
            name: 'Missing Coords',
            formatted: 'Missing Coords',
            lat: null,
            lon: null,
          },
        ],
      };

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      } as Response);

      const results = await service.autocompleteHub('Airport');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Valid Hub');
    });

    it('should throw BadGatewayException on provider 401/403 (quota/auth error)', async () => {
      mockConfigService.get.mockReturnValue('test-api-key');
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

      await expect(service.autocompleteHub('Airport')).rejects.toThrow(
        BadGatewayException,
      );
    });

    it('should throw GatewayTimeoutException when provider request times out', async () => {
      mockConfigService.get.mockReturnValue('test-api-key');
      const timeoutErr = new Error('The operation was aborted');
      timeoutErr.name = 'TimeoutError';
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(timeoutErr);

      await expect(service.autocompleteHub('Airport')).rejects.toThrow(
        GatewayTimeoutException,
      );
    });
  });

  describe('searchNearby', () => {
    const baseDto: SearchFreetimeDto = {
      lat: 51.47002,
      lon: -0.45429,
      hubName: 'London Heathrow Airport',
      freeTimeMinutes: 120,
      category: 'food',
      dwellMinutes: 30,
      bufferMinutes: 30,
    };

    it('should return empty places list if Places API returns no results without calling matrix', async () => {
      mockConfigService.get.mockReturnValue('test-api-key');
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ features: [] }),
      } as Response);

      const result = await service.searchNearby(baseDto);
      expect(result.places).toHaveLength(0);
      expect(fetchSpy).toHaveBeenCalledTimes(1); // Only places called, matrix skipped
      expect(result.providerCostFormula).toContain('Route Matrix skipped');
    });

    it('should calculate fit correctly: FITS when total <= freeTime, DOES_NOT_FIT when total > freeTime', async () => {
      mockConfigService.get.mockReturnValue('test-api-key');

      // 2 places returned
      const mockPlacesResponse = {
        features: [
          {
            properties: {
              place_id: 'p1',
              name: 'Close Cafe',
              distance: 500,
              formatted: 'Close Cafe, Airport Rd',
              categories: ['catering.cafe'],
            },
            geometry: { coordinates: [-0.45, 51.47] },
          },
          {
            properties: {
              place_id: 'p2',
              name: 'Far Bistro',
              distance: 2500,
              formatted: 'Far Bistro, Distant St',
              categories: ['catering.restaurant'],
            },
            geometry: { coordinates: [-0.42, 51.46] },
          },
        ],
      };

      // Matrix returns walking times:
      // p1: 600s = 10 min. total = 10 (out) + 30 (dwell) + 10 (return) + 30 (buffer) = 80 min <= 120 min -> FITS
      // p2: 2400s = 40 min. total = 40 (out) + 30 (dwell) + 40 (return) + 30 (buffer) = 140 min > 120 min -> DOES_NOT_FIT
      const mockMatrixResponse = {
        sources_to_targets: [
          [
            { time: 600, distance: 750 },
            { time: 2400, distance: 3000 },
          ],
        ],
      };

      jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockPlacesResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockMatrixResponse,
        } as Response);

      const result = await service.searchNearby(baseDto);

      expect(result.places).toHaveLength(2);

      const p1 = result.places.find((p) => p.name === 'Close Cafe')!;
      expect(p1.outboundWalkMinutes).toBe(10);
      expect(p1.returnWalkMinutes).toBe(10);
      expect(p1.totalTripMinutes).toBe(80);
      expect(p1.fits).toBe(true);
      expect(p1.fitStatus).toBe('FITS');
      expect(p1.marginMinutes).toBe(40);

      const p2 = result.places.find((p) => p.name === 'Far Bistro')!;
      expect(p2.outboundWalkMinutes).toBe(40);
      expect(p2.returnWalkMinutes).toBe(40);
      expect(p2.totalTripMinutes).toBe(140);
      expect(p2.fits).toBe(false);
      expect(p2.fitStatus).toBe('DOES_NOT_FIT');
      expect(p2.marginMinutes).toBe(-20);

      // FITS places must be sorted before DOES_NOT_FIT places
      expect(result.places[0].fitStatus).toBe('FITS');
      expect(result.places[1].fitStatus).toBe('DOES_NOT_FIT');
    });

    it('should handle null/unavailable route in Route Matrix gracefully', async () => {
      mockConfigService.get.mockReturnValue('test-api-key');

      const mockPlacesResponse = {
        features: [
          {
            properties: {
              place_id: 'p_unreachable',
              name: 'Island Cafe',
              distance: 800,
              formatted: 'Island Cafe, Lake',
            },
            geometry: { coordinates: [-0.45, 51.47] },
          },
        ],
      };

      const mockMatrixResponse = {
        sources_to_targets: [
          [
            { time: null, distance: null }, // Unreachable target
          ],
        ],
      };

      jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockPlacesResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockMatrixResponse,
        } as Response);

      const result = await service.searchNearby(baseDto);
      expect(result.places).toHaveLength(1);
      const place = result.places[0];
      expect(place.outboundWalkMinutes).toBeNull();
      expect(place.returnWalkMinutes).toBeNull();
      expect(place.totalTripMinutes).toBeNull();
      expect(place.fits).toBe(false);
      expect(place.fitStatus).toBe('UNAVAILABLE');
    });

    it('should throw BadGatewayException if Places API returns 401', async () => {
      mockConfigService.get.mockReturnValue('test-api-key');
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(service.searchNearby(baseDto)).rejects.toThrow(
        BadGatewayException,
      );
    });

    it('should include required attribution and travel-time disclaimer in response', async () => {
      mockConfigService.get.mockReturnValue('test-api-key');
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ features: [] }),
      } as Response);

      const result = await service.searchNearby(baseDto);
      expect(result.attribution.osmText).toBe('© OpenStreetMap contributors');
      expect(result.attribution.osmUrl).toBe(
        'https://www.openstreetmap.org/copyright',
      );
      expect(result.attribution.geoapifyText).toBe('Powered by Geoapify');
      expect(result.attribution.geoapifyUrl).toBe('https://www.geoapify.com/');
      expect(result.disclaimer).toContain('Travel-time estimates');
    });
  });
});
