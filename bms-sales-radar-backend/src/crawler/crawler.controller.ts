import {
  Controller,
  Post,
} from '@nestjs/common';

import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(
    private readonly crawlerService: CrawlerService,
  ) {}
  
  @Post('test')
  runTestCrawler() {
    return this.crawlerService.runTestCrawler();
  }
}