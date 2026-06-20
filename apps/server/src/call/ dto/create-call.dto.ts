import {
  IsEnum,
  IsString,
} from 'class-validator';

export enum CallTypeDto {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
}

export class CreateCallDto {
  @IsString()
  callerId: string;

  @IsString()
  receiverId: string;

  @IsEnum(CallTypeDto)
  type: CallTypeDto;
}