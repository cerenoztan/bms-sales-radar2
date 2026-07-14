import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessService } from './business.service';
import { Business } from './business.entity';
import { ScoreModule } from '../score/score.module';

@Module({
  imports: [TypeOrmModule.forFeature([Business]),ScoreModule],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}