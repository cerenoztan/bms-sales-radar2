import { Module } from '@nestjs/common';
import { ScoreModule } from '../score/score.module';
import { ExcelReportService } from './excel-report.service';
import { ReportController } from './report.controller';

@Module({
  imports: [ScoreModule], // ExcelReportService uses ScoreService
  controllers : [ReportController],
  providers:[ExcelReportService],
  exports: [ExcelReportService],
})
export class ReportModule {}