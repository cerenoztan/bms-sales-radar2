import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Business } from '../business/business.entity';
import { Source } from './source.entity';
import { SourceController } from './source.controller';
import { SourceService } from './source.service';

@Module({
    //To inject repositories at SourceService
  imports: [
    TypeOrmModule.forFeature([
      Source,
      Business,
    ]),
  ],
  controllers: [SourceController],
  providers: [SourceService],
  exports:[SourceService],
})
export class SourceModule {}

