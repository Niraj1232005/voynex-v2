import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  FreetimeService,
  FreeTimeSearchResult,
  HubCandidate,
} from './freetime.service';
import { AutocompleteDto } from './dto/autocomplete.dto';
import { SearchFreetimeDto } from './dto/search-freetime.dto';

@Controller('freetime')
export class FreetimeController {
  constructor(private readonly freetimeService: FreetimeService) {}

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Get('autocomplete')
  async autocomplete(@Query() query: AutocompleteDto): Promise<HubCandidate[]> {
    return this.freetimeService.autocompleteHub(query.text);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('search')
  async search(@Body() dto: SearchFreetimeDto): Promise<FreeTimeSearchResult> {
    return this.freetimeService.searchNearby(dto);
  }
}
