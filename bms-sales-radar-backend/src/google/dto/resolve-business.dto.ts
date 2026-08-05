import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class ResolveBusinessDto {
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title!: string;

  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
  })
  instagramUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  snippet?: string;
}