import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Delete ,
  Post ,
  UseGuards,
} from '@nestjs/common';

import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

@Controller('businesses')// main address of all endpoints
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BusinessController {
    constructor(private readonly businessService: BusinessService) {}

  @Get() //endpoint
  @RequirePermissions('BUSINESS_VIEW')
  findAllSortedByScore() {
    return this.businessService.findAllSortedByScore();
  }

  @Post() //endpoint
  @RequirePermissions('BUSINESS_CREATE')
  create(@Body() createBusinessDto: CreateBusinessDto) {
    //controller sends createBusinessDto to service
    return this.businessService.create(createBusinessDto,);
  }

  @Patch(':id')
  @RequirePermissions('BUSINESS_UPDATE')
  update(@Param('id',ParseIntPipe) id : number,
  @Body() updateBusinessDto: UpdateBusinessDto) {
    return this.businessService.update(id,updateBusinessDto);
  }

  @Get(':id')
  @RequirePermissions('BUSINESS_VIEW')
  findOne(@Param('id',ParseIntPipe) id : number){
    return this.businessService.findOne(id);
  }

  @Delete(':id')
  @RequirePermissions('BUSINESS_DELETE')
  remove(@Param('id',ParseIntPipe) id:number){
    return this.businessService.remove(id);
  }
}


//Endpointler frontend ve backend'in iletişim kapılarıdır.
//Controller içindeki erişilebilir URL'lerdir.
//HTTP istek-HTTP yanıt 
//API :Application Programming Interface :uygulamanın dışarıya açtığı fonksiyonlardır.
//API endpoints 

//CRUD C:CREATE R:READ U:UPDATE D:DELETE
