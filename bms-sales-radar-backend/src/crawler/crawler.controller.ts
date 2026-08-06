import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CrawlerService } from './crawler.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('crawler')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('SEARCH_DISCOVERY_VIEW')
export class CrawlerController {
  constructor(
    private readonly crawlerService: CrawlerService,
  ) {}

  @Get('google/preview')
  previewGoogleSearch(
    @Query('keyword') keyword?: string,
  ) {
    if (!keyword?.trim()) {
      throw new BadRequestException(
        'keyword parametresi zorunludur.',
      );
    }

    return this.crawlerService.previewGoogleSearch(
      keyword.trim(),
    );
  }

  @Post('google/run')
  runGoogleSearch(
    @Query('keyword') keyword?: string,
  ) {
    if (!keyword?.trim()) {
      throw new BadRequestException(
        'keyword parametresi zorunludur.',
      );
    }

    return this.crawlerService.runGoogleSearch(
      keyword.trim(),
    );
  }
}
