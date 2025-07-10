import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ProgressService } from './progress.service';
import { MarkProgressDto } from './dto/mark-progress.dto';
import { User } from 'src/common/decorators/user.decorators';
import { IUser } from 'src/common/types/user.types';
import { EnrolledGuard } from 'src/common/guards/enrolled.guard';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @UseGuards(EnrolledGuard)
  @Post(':courseId')
  async mark(
    @Param('courseId') courseId: string,
    @User() user: IUser,
    @Body() dto: MarkProgressDto,
  ) {
    const progress = await this.progressService.markProgress(
      user.id,
      courseId,
      dto,
    );
    return {
      data: progress,
      message: 'Progress updated',
    };
  }

  @UseGuards(EnrolledGuard)
  @Get(':courseId')
  async getCourseProgress(
    @User() user: IUser,
    @Param('courseId') courseId: string,
  ) {
    const data = await this.progressService.getCourseProgress(
      user.id,
      courseId,
    );
    return {
      data,
      message: 'Course progress retrieved',
    };
  }

  @UseGuards(EnrolledGuard)
  @Get(':courseId/next-prev/:currentLessonId')
  async getNextLesson(
    @Param('courseId') courseId: string,
    @Param('currentLessonId') lessonId: string,
  ) {
    const data = await this.progressService.getNextAndPrevLessonId(
      courseId,
      lessonId,
    );

    return {
      data: {
        nextLessonId: data?.nextLessonId,
        prevLessonId: data?.prevLessonId,
      },
      message: 'Next and previous lesson ID retrieved',
    };
  }
}
