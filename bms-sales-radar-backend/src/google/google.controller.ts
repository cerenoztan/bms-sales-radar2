import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import {
  DistrictPlaceResult,
  GoogleService,
} from './google-place.service';
import { GoogleSearchService } from './google-search.service';
import { GoogleSearchResult } from './interfaces/google-search.interface';

@Controller('google')
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly googleSearchService: GoogleSearchService,
  ) {}

  @Get('istanbul-businesses')
  async searchBusinesses(): Promise<DistrictPlaceResult[]> {
    return this.googleService.searchBusinessesInIstanbul();
  }

  @Get('new-businesses')
  findNewBusinesses() {
    return this.googleService.findNewBusinesses();
  }

  @Get('search')
  searchGoogle(
    @Query('keyword') keyword: string,
    @Query('limit') limit?: string,
  ): Promise<GoogleSearchResult[]> {
    const parsedLimit = Number(limit);

    return this.googleSearchService.search(
      keyword,
      Number.isFinite(parsedLimit) ? parsedLimit : 10,
    );
  }
}