import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SearchKeywordController } from './search-keyword.controller';
import { SearchKeyword } from './search-keyword.entity';
import { SearchKeywordService } from './search-keyword.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SearchKeyword,
    ]),
  ],
  controllers: [
    SearchKeywordController,
  ],
  providers: [
    SearchKeywordService,
  ],
  exports: [
    SearchKeywordService,
  ],
})
export class SearchKeywordModule {}