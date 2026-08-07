import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { CaptionAnalyzerService } from './caption-analyzer.service';
import { AnalyzeCaptionDto } from './dto/analyze-caption.dto';

@Controller('analyzer')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('SEARCH_DISCOVERY_VIEW')
export class AnalyzerController {
  constructor(private readonly captionAnalyzer: CaptionAnalyzerService) {}

  @Post('caption')
  analyzeCaption(@Body() dto: AnalyzeCaptionDto) {
    return this.captionAnalyzer.analyze(dto.caption);
  }
}
