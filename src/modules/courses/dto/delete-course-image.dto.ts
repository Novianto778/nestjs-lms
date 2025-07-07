import { IsString } from 'class-validator';

export class DeleteCourseImageDto {
  @IsString()
  courseId: string;
}
