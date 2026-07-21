import {
  Controller,
  Get,
  Post,
} from '@nestjs/common';

import { FilgeziAdapter } from './adapters/filgezi.adapter';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly filgeziAdapter: FilgeziAdapter,
  ) {}

  @Get('filgezi/preview')
  previewFilgezi() {
    return this.filgeziAdapter.crawl();
  }

  @Post('filgezi')
  crawlFilgezi() {
    return this.crawlerService.crawlFilgezi();
  }
}