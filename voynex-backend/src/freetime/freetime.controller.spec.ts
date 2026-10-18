import { Test, TestingModule } from '@nestjs/testing';
import { FreetimeController } from './freetime.controller';
import { FreetimeService, FreeTimeSearchResult } from './freetime.service';
import { SearchFreetimeDto } from './dto/search-freetime.dto';

describe('FreetimeController', () => {
  let controller: FreetimeController;
  let service: FreetimeService;

  const mockService = {
    autocompleteHub: jest.fn(),
    searchNearby: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreetimeController],
      providers: [
        {
          provide: FreetimeService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<FreetimeController>(FreetimeController);
    service = module.get<FreetimeService>(FreetimeService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call freetimeService.autocompleteHub and return candidates', async () => {
    const mockCandidates = [
      {
        name: 'Heathrow Airport',
        formatted: 'Heathrow Airport, Longford, London, UK',
        lat: 51.47002,
        lon: -0.45429,
        city: 'London',
        country: 'United Kingdom',
      },
    ];
    mockService.autocompleteHub.mockResolvedValue(mockCandidates);

    const result = await controller.autocomplete({ text: 'Heathrow' });
    expect(result).toEqual(mockCandidates);
    expect(mockService.autocompleteHub).toHaveBeenCalledWith('Heathrow');
  });

  it('should call freetimeService.searchNearby and return search results', async () => {
    const searchDto: SearchFreetimeDto = {
      lat: 51.47002,
      lon: -0.45429,
      hubName: 'London Heathrow Airport',
      freeTimeMinutes: 120,
      category: 'food',
      dwellMinutes: 30,
      bufferMinutes: 30,
    };

    const mockSearchResult: FreeTimeSearchResult = {
      hub: { name: 'London Heathrow Airport', lat: 51.47002, lon: -0.45429 },
      freeTimeMinutes: 120,
      dwellMinutes: 30,
      bufferMinutes: 30,
      category: 'food',
      places: [],
      providerCostFormula: '1 credit (Places API)',
      disclaimer: 'Disclaimer text',
      attribution: {
        osmText: '© OpenStreetMap contributors',
        osmUrl: 'https://www.openstreetmap.org/copyright',
        geoapifyText: 'Powered by Geoapify',
        geoapifyUrl: 'https://www.geoapify.com/',
      },
    };

    mockService.searchNearby.mockResolvedValue(mockSearchResult);

    const result = await controller.search(searchDto);
    expect(result).toEqual(mockSearchResult);
    expect(mockService.searchNearby).toHaveBeenCalledWith(searchDto);
  });
});
