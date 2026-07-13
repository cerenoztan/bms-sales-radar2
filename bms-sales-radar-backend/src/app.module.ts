import { Module } from '@nestjs/common';
import { ReportModule } from './report/report.module';


@Module({
  imports: [ReportModule], // uses ScoreModule already
})
export class AppModule {}

//NetJS groups thing into modules combining them into AppModule