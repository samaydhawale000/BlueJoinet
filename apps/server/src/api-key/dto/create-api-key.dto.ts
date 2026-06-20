import {
  IsString,
  MinLength,
} from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  projectId: string;
}