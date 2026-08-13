import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSmtpSettingsDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  host: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  username: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  password?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  fromName: string;
}
