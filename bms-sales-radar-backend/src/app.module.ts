import { Module } from '@nestjs/common';
import { BusinessModule } from './business/business.module';
import { ReportModule } from './report/report.module';
import { ScoreModule } from './score/score.module';



@Module({
  imports: [BusinessModule,ReportModule,ScoreModule], // uses ScoreModule already
})
export class AppModule {}

//NetJS groups thing into modules combining them into AppModule