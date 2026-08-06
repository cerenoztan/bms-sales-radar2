import {
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';

import { BusinessStatus } from '../business-status.enum';

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @IsOptional()
  @IsUrl()
  facebookUrl?: string;

  @IsOptional()
  @IsUrl()
  googleMapsUrl?: string;

  @IsOptional()
  @IsString()
  googlePlaceId?: string;

  @IsOptional()
  @IsString()
  discoverySource?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsPhoneNumber('TR')
  phone?: string;

  @IsOptional()
  @IsEnum(BusinessStatus)
  status?: BusinessStatus;
}

//all optional
