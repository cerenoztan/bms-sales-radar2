import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';

import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(
    private readonly crawlerService: CrawlerService,
  ) {}

  @Get('google/preview')
  previewGoogleSearch(
    @Query('keyword') keyword?: string,
  ) {
    if (!keyword?.trim()) {
      throw new BadRequestException(
        'keyword parametresi zorunludur.',
      );
    }

    return this.crawlerService.previewGoogleSearch(
      keyword.trim(),
    );
  }

  @Post('google/run')
  runGoogleSearch(
    @Query('keyword') keyword?: string,
  ) {
    if (!keyword?.trim()) {
      throw new BadRequestException(
        'keyword parametresi zorunludur.',
      );
    }

    return this.crawlerService.runGoogleSearch(
      keyword.trim(),
    );
  }
}