import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SaveSearchResultDto } from './dto/save-search-result.dto';
import { CreateSourceDto } from './dto/create-source.dto';
import { SourceService } from './source.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('sources')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('SEARCH_DISCOVERY_VIEW')
export class SourceController {
  constructor(
    private readonly sourceService: SourceService,
  ) {}
  @Post()
  create(@Body() createSourceDto:CreateSourceDto){
        return this.sourceService.create(
          createSourceDto.name,
          createSourceDto.url,
          createSourceDto.externalId,
          createSourceDto.businessID,);
  }
  
  @Post('search-result')
  saveSearchResult(
  @Body() dto: SaveSearchResultDto,
  ) {
  return this.sourceService.saveSearchResult(dto);
  }

  @Get()
  findSources(){
    return this.sourceService.findSources();
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number,){
    return this.sourceService.remove(id);
  }

  @Get('business/:businessID')
  findByBusiness(  @Param('businessID', ParseIntPipe) businessID: number,){
    return this.sourceService.findByBusiness(businessID);
  }

  

}


//type eklemeli miyim source type ???
