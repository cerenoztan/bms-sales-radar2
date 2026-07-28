import { Controller, Get, Post } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(
    private readonly crawlerService: CrawlerService,
  ) {}

  @Get('happy-group/preview')
  previewHappyGroup() {
    return this.crawlerService.previewHappyGroup();
  }

  @Post('happy-group/run')
  runHappyGroup() {
    return this.crawlerService.runHappyGroup();
  }
  @Get('retail/preview')
   previewRetailTurkiye() {
  return this.crawlerService.previewRetailTurkiye();
  } 
  @Post('retail/run')
   runRetailTurkiye() {
   return this.crawlerService.runRetailTurkiye();
  }
}