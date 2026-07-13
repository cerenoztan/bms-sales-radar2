import {
  Body,
  Controller,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Controller('businesses')
export class BusinessController {
  @Post()
  create(@Body() createBusinessDto: CreateBusinessDto) {
    return {
      
      data: createBusinessDto,
    };
  }

  @Patch()
  update(@Body() updateBusinessDto: UpdateBusinessDto) {
    return {
    
      data: updateBusinessDto,
    };
  }
}

//normalde oluşturuldu ve güncellendi yazmayacak