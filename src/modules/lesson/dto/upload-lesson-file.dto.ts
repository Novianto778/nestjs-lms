import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadLessonFileDto {
  @IsString()
  @IsNotEmpty()
  base64File: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsString()
  @IsNotEmpty()
  lessonId: string;
}
