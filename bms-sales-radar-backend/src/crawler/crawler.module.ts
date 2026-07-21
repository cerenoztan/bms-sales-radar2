import { Module } from '@nestjs/common';

import { BusinessModule } from '../business/business.module';
import { SourceModule } from '../source/source.module';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';
import { CrawlerRegistry } from './crawler.registry';
import { CafeCrawler } from './cafe-crawler';
import { ReportModule } from '../report/report.module';
@Module({
  imports: [
    BusinessModule,
    SourceModule,ReportModule],
    
  controllers: [CrawlerController],
  providers: [CrawlerService,CrawlerRegistry,CafeCrawler],

  exports:[CrawlerService,],
})
export class CrawlerModule {}