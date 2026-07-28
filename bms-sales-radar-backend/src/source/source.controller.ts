import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { CreateSourceDto } from './dto/create-source.dto';
import { SourceService } from './source.service';

@Controller('sources')
export class SourceController {
  constructor(
    private readonly sourceService: SourceService,
  ) {}
  @Post()
  create(@Body() createSourceDto:CreateSourceDto){
        return this.sourceService.create(createSourceDto.businessID,createSourceDto.name,createSourceDto.url,createSourceDto.externalId,);
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