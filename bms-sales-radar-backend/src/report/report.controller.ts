import {
  Controller,
  Get,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ExcelReportService } from './excel-report.service';
import { BusinessService } from '../business/business.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportController {
  constructor(
    private readonly excelReportService: ExcelReportService,
    private readonly businessService: BusinessService,
  ) {}

  @Get('candidates')
  @RequirePermissions('REPORT_VIEW')
  getSavedCandidates() {
    return this.businessService.findAllSortedByScore();
  }

  @Get('businesses/excel')
  @RequirePermissions('REPORT_VIEW')
  async downloadBusinessReport(): Promise<StreamableFile> {
    const candidates =
      await this.businessService.findAllSortedByScore();

    const buffer = await this.excelReportService
      .createSavedCandidatesReport(candidates);

    return new StreamableFile(buffer, {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition:
        'attachment; filename="saved-candidates.xlsx"',
    });
  }
}
