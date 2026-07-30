import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSourceDto {
  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  businessID?: number;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  externalId?: string;
}