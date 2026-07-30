import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';
import { GoogleSearchService } from './google-search.service';

@Module({
  imports: [HttpModule],
  controllers: [GoogleController],
  providers: [GoogleService,GoogleSearchService,],
  exports: [GoogleService,GoogleSearchService,],
})
export class GoogleModule {}