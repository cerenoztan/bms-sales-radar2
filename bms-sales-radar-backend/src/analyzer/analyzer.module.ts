import { Module } from '@nestjs/common';

import { AnalyzerController } from './analyzer.controller';
import { CaptionAnalyzerService } from './caption-analyzer.service';

@Module({
  controllers: [AnalyzerController],
  providers: [CaptionAnalyzerService],
})
export class AnalyzerModule {}
