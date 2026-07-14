import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Delete ,
  Post ,
} from '@nestjs/common';

import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Controller('businesses')// main address of all endpoints
export class BusinessController {
    constructor(private readonly businessService: BusinessService) {}

  @Get() //endpoint
  findAllSortedByScore() {
    return this.businessService.findAllSortedByScore();
  }

  @Post() //endpoint
  create(@Body() createBusinessDto: CreateBusinessDto) {
    //controller sends createBusinessDto to service
    return this.businessService.create(createBusinessDto,);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id : number,
  @Body() updateBusinessDto: UpdateBusinessDto) {
    return this.businessService.update(id,updateBusinessDto);
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id : number){
    return this.businessService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id:number){
    return this.businessService.remove(id);
  }
}


//Endpointler frontend ve backend'in iletişim kapılarıdır.
//Controller içindeki erişilebilir URL'lerdir.
//HTTP istek-HTTP yanıt 
//API :Application Programming Interface :uygulamanın dışarıya açtığı fonksiyonlardır.
//API endpoints 