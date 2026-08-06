import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { BusinessResolverService } from './business-resolver.service';
import { ResolveBusinessDto } from './dto/resolve-business.dto';
import {
  DistrictPlaceResult,
  GoogleService,
} from './google-place.service';
import { GoogleSearchService } from './google-search.service';
import { ResolvedBusinessMatch } from './interfaces/google-place.interface';
import { GoogleSearchResult } from './interfaces/google-search.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('google')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('SEARCH_DISCOVERY_VIEW')
export class GoogleController {
  constructor(
    private readonly googleService:
      GoogleService,

    private readonly googleSearchService:
      GoogleSearchService,

    private readonly businessResolverService:
      BusinessResolverService,
  ) {}

  @Get('istanbul-businesses')
  searchBusinesses(): Promise<
    DistrictPlaceResult[]
  > {
    return this.googleService
      .searchBusinessesInIstanbul();
  }

  @Get('new-businesses')
  findNewBusinesses() {
    return this.googleService
      .findNewBusinesses();
  }

  @Post('resolve-business')
  resolveBusiness(
    @Body() dto: ResolveBusinessDto,
  ): Promise<ResolvedBusinessMatch[]> {
    return this.businessResolverService
      .resolveBusiness(
        dto.businessName,
        dto.sourceUrl,
        dto.locationHint,
        dto.city,
      );
  }

  @Get('search')
  searchGoogle(
    @Query('keyword')
    keyword: string,

    @Query('limit')
    limit?: string,
  ): Promise<GoogleSearchResult[]> {
    const parsedLimit =
      Number(limit);

    return this.googleSearchService
      .search(
        keyword,
        Number.isFinite(
          parsedLimit,
        )
          ? parsedLimit
          : 10,
      );
  }
}
