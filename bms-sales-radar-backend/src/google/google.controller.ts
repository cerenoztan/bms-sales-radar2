import {
  BadRequestException,
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { GoogleService } from './google.service';
import { GooglePlace } from './interfaces/google-place.interface';

@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get('future-businesses')
  async searchFutureBusinesses(
    @Query('type') type?: 'cafe' | 'restaurant',
  ): Promise<GooglePlace[]> {
    if (!type || !['cafe', 'restaurant'].includes(type)) {
      throw new BadRequestException(
        'type yalnızca cafe veya restaurant olabilir.',
      );
    }

    return this.googleService.searchFutureBusinessesInIstanbul(type);
  }
}