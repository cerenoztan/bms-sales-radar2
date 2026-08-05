import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class SaveSearchResultDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  name!: string;

  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
  })
  url!: string;

  @IsIn(['INSTAGRAM', 'LINKEDIN'])
  platform!: 'INSTAGRAM' | 'LINKEDIN';

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  searchQuery!: string;
}