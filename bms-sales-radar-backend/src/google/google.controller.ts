import {
  BadRequestException,
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { GoogleService } from './google.service';
import { GooglePlace } from './interfaces/google-place.interface';
import { GoogleSearchService } from './google-search.service';
import { GoogleSearchResult } from './interfaces/google-search.interface';

@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService,
    private readonly googleSearchService:GoogleSearchService,
  ) {}

  @Get('istanbul-businesses')
  async searchBusinesses(
    @Query('type') type?: 'cafe' | 'restaurant',
  ): Promise<GooglePlace[]> {
    if (!type || !['cafe', 'restaurant'].includes(type)) {
      throw new BadRequestException(
        'type yalnızca cafe veya restaurant olabilir.',
      );
    }

    return this.googleService.searchBusinessesInIstanbul(type);
  }
   @Get('web-search')
  async webSearch(
  @Query('keyword') keyword?: string,
  ): Promise<GoogleSearchResult[]> {
  if (!keyword?.trim()) {
    throw new BadRequestException(
      'keyword parametresi zorunludur.',
    );
  }

   return this.googleSearchService.search(
    keyword,
  );
  }
}