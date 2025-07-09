import { IsInt, IsString } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  title: string;

  @IsInt()
  order: number;

  @IsString()
  courseId: string;
}
