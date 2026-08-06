import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class ResolveBusinessDto {
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  businessName!: string;

  @IsOptional()
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
  })
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  locationHint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;
}
