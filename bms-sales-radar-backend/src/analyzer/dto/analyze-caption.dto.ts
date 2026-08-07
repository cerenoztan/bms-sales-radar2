import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AnalyzeCaptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20_000)
  caption!: string;
}
