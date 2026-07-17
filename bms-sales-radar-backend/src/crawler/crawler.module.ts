import { Module } from '@nestjs/common';

import { BusinessModule } from '../business/business.module';
import { SourceModule } from '../source/source.module';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';

@Module({
  imports: [
    BusinessModule,
    SourceModule,],
    
  controllers: [CrawlerController],
  providers: [CrawlerService],
})
export class CrawlerModule {}