import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { BusinessModule } from '../business/business.module';
import { SourceModule } from '../source/source.module';

import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';

import { HappyGroupAdapter } from './adapters/happy-group.adapter';
import { RetailTurkiyeAdapter } from './adapters/retail-türkiye.adapter';
import { MagazaAcilislariAdapter } from './adapters/magaza-acilislari.adapter';

@Module({
  imports: [
    HttpModule,
    BusinessModule,
    SourceModule,
  ],
  controllers: [CrawlerController],
  providers: [
    CrawlerService,
    HappyGroupAdapter,
    RetailTurkiyeAdapter,
    MagazaAcilislariAdapter,
  ],
  exports: [
    CrawlerService,
    HappyGroupAdapter,
    RetailTurkiyeAdapter,
  ],
})
export class CrawlerModule {}