import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSourceDto {
  @Type(() => Number)
  @IsInt()
  businessID!: number;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  url!: string;
}