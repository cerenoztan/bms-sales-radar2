import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CreateSearchKeywordDto } from './dto/create-search-keyword.dto';
import { UpdateSearchKeywordDto } from './dto/update-search-keyword.dto';
import { SearchKeywordService } from './search-keyword.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('search-keywords')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('SEARCH_DISCOVERY_VIEW')
export class SearchKeywordController {
  constructor(
    private readonly keywordService:
      SearchKeywordService,
  ) {}

  @Get()
  findAll() {
    return this.keywordService.findAll();
  }

  @Get('active')
  findActive() {
    return this.keywordService.findActive();
  }

  @Post()
  create(
    @Body() dto: CreateSearchKeywordDto,
  ) {
    return this.keywordService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSearchKeywordDto,
  ) {
    return this.keywordService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.keywordService.remove(id);
  }

  @Delete(':id/default')
  removeDefault(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.keywordService.removeDefault(id);
  }
}
