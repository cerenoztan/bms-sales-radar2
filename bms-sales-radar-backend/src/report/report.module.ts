import { Module } from '@nestjs/common';
import { ScoreModule } from '../score/score.module';
import { ExcelReportService } from './excel-report.service';
import { ReportController } from './report.controller';
import { BusinessModule } from '../business/business.module';
import { ReportScheduler } from './scheduler';
import { GoogleModule } from '../google/google.module';

@Module({
  imports: [ScoreModule,BusinessModule,GoogleModule],
  controllers : [ReportController],
  providers:[ExcelReportService,ReportScheduler],
  exports: [ExcelReportService],
})
export class ReportModule {}
