import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsUrl()
  @IsOptional()
  contentUrl?: string;

  // @IsEnum(LessonType)
  // contentType: LessonType;

  @IsInt()
  @Type(() => Number)
  order: number;

  @IsString()
  moduleId: string;
}
