import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';


export class CreateUserDto {
  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  roleId?:number;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}