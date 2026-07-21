import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { BusinessModule } from '../business/business.module';
import { SourceModule } from '../source/source.module';

import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';
import { FilgeziAdapter } from './adapters/filgezi.adapter';

@Module({
  imports: [
    HttpModule,
    BusinessModule,
    SourceModule,
  ],
  controllers: [CrawlerController],
  providers: [
    CrawlerService,
    FilgeziAdapter,
  ],
  exports:[CrawlerService,],
})
export class CrawlerModule {}