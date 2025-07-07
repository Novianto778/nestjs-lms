import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadCourseImageDto {
  @IsString()
  @IsNotEmpty()
  base64File: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;
}
