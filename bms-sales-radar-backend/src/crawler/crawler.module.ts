import { Module } from '@nestjs/common';

import { GoogleModule } from '../google/google.module';
import { SourceModule } from '../source/source.module';

import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';

@Module({
  imports: [
    GoogleModule,
    SourceModule,
  ],
  controllers: [CrawlerController],
  providers: [CrawlerService],
  exports: [CrawlerService],
})
export class CrawlerModule {}