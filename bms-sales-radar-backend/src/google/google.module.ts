import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GoogleController } from './google.controller';
import { GoogleService } from './google-place.service';
import { GoogleSearchService } from './google-search.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GooglePlaceEntity } from './entities/google-place.entity';
import { BusinessResolverService } from './business-resolver.service';
import { GoogleScanRunEntity } from './entities/google-scan-run.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      GooglePlaceEntity,
      GoogleScanRunEntity,
    ]),
  ],
  controllers: [GoogleController],
  providers: [GoogleService,GoogleSearchService,BusinessResolverService,],
  exports: [GoogleService,GoogleSearchService,BusinessResolverService,],
})
export class GoogleModule {}
