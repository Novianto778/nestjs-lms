import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateCourseDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  slug?: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsInt()
  @Type(() => Number)
  price: number;

  @IsBoolean()
  isPublished?: boolean;

  @IsString()
  instructorId: string;
}
