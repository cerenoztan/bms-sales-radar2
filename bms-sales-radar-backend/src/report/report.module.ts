import { Module } from '@nestjs/common';
import { ScoreModule } from '../score/score.module';
import { ExcelReportService } from './excel-report.service';
import { ReportController } from './report.controller';
import { BusinessModule } from '../business/business.module';
import { ReportScheduler } from './scheduler';

@Module({
  imports: [ScoreModule,BusinessModule], // ExcelReportService uses ScoreService
  controllers : [ReportController],
  providers:[ExcelReportService,ReportScheduler],
  exports: [ExcelReportService],
})
export class ReportModule {}