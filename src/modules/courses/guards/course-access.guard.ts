// src/common/guards/course-access.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Role } from 'generated/prisma';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CourseAccessGuard implements CanActivate {
  constructor(private databaseService: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const courseId = request.params.courseId;

    if (!user || !courseId) {
      throw new ForbiddenException('Invalid request');
    }

    // 1. Admin has access to all courses
    if (user.role === Role.ADMIN) return true;

    // 2. Instructor — only access their own courses
    if (user.role === Role.INSTRUCTOR) {
      const course = await this.databaseService.course.findUnique({
        where: { id: courseId },
        select: { instructorId: true },
      });
      if (!course) throw new ForbiddenException('Course not found');
      if (course.instructorId === user.id) return true;
      throw new ForbiddenException('You are not the instructor of this course');
    }

    // 3. Student — must be enrolled
    const enrollment = await this.databaseService.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    return true;
  }
}
