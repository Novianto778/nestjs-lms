import { IsBoolean, IsUUID } from 'class-validator';

export class MarkProgressDto {
  @IsUUID()
  lessonId: string;

  @IsBoolean()
  completed: boolean;
}
