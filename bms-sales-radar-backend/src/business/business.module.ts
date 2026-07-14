import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessService } from './business.service';
import { Business } from './business.entity';
import { ScoreModule } from '../score/score.module';
import { DuplicateCheckerService } from './duplicate-checker.service';

@Module({
  imports: [TypeOrmModule.forFeature([Business]),ScoreModule],
  controllers: [BusinessController],
  providers: [BusinessService,DuplicateCheckerService],
  exports: [BusinessService],
})
export class BusinessModule {}