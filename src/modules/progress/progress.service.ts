import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { MarkProgressDto } from './dto/mark-progress.dto';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class ProgressService {
  constructor(private databaseService: DatabaseService) {}

  async markProgress(userId: string, courseId: string, dto: MarkProgressDto) {
    // Find enrollment
    const enrollment = await this.databaseService.enrollment.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this course.');
    }

    // Upsert progress
    return this.databaseService.progress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId: dto.lessonId,
        },
      },
      update: {
        completed: dto.completed,
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId: dto.lessonId,
        completed: dto.completed,
      },
    });
  }

  async getCourseProgress(userId: string, courseId: string) {
    // Get enrollment
    const enrollment = await this.databaseService.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this course.');
    }

    // Get all lessons in the course
    const lessons = await this.databaseService.lesson.findMany({
      where: {
        module: {
          courseId,
        },
      },
      select: { id: true },
    });

    const lessonIds = lessons.map((l) => l.id);

    // Get user's completed progress
    const completed = await this.databaseService.progress.count({
      where: {
        enrollmentId: enrollment.id,
        lessonId: { in: lessonIds },
        completed: true,
      },
    });

    const total = lessonIds.length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      total,
      completed,
      percentage,
    };
  }

  async getNextAndPrevLessonId(courseId: string, currentLessonId: string) {
    // Get all lessons sorted by module.order, then lesson.order
    const lessons = await this.databaseService.lesson.findMany({
      where: {
        module: { courseId },
      },
      orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
      select: { id: true },
    });

    const index = lessons.findIndex((l) => l.id === currentLessonId);

    if (index === -1) {
      throw new NotFoundException('Current lesson not found in course');
    }

    const prevLessonId = index > 0 ? lessons[index - 1]?.id : null;
    const nextLessonId =
      index < lessons.length - 1 ? lessons[index + 1]?.id : null;

    return {
      prevLessonId,
      nextLessonId,
    };
  }
}
