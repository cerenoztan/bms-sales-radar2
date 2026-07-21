import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';

import { BusinessType } from '../../crawler/crawler-business-type.enum';
import { BusinessStatus } from '../business-status.enum';

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @IsOptional()
  @IsPhoneNumber('TR')
  phone?: string;

  @IsOptional()
  @IsEnum(BusinessType)
  type?: BusinessType;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  websiteUrl?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  openingDate?: Date;

  @IsOptional()
  @IsString()
  discoveredArea?: string;

  @IsOptional()
  @IsEnum(BusinessStatus)
  status?: BusinessStatus;
}