import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class EnrollmentService {
  constructor(private databaseService: DatabaseService) {}

  async enroll(userId: string, courseId: string) {
    const course = await this.databaseService.course.findUnique({
      where: { id: courseId },
    });

    if (!course || !course.isPublished) {
      throw new NotFoundException('Course not available');
    }

    const alreadyEnrolled = await this.databaseService.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (alreadyEnrolled) {
      throw new BadRequestException('Already enrolled');
    }

    // If the course is paid, you can later add payment check here

    const enrollment = await this.databaseService.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });

    return {
      message: 'Successfully enrolled in course',
      data: enrollment,
    };
  }

  async getCourseStudents(courseId: string) {
    const enrollments = await this.databaseService.enrollment.findMany({
      where: { courseId },
      include: {
        user: true,
      },
    });

    return {
      message: 'Enrolled students',
      data: enrollments.map((e) => e.user),
    };
  }

  async getMyCourses(userId: string) {
    const enrollments = await this.databaseService.enrollment.findMany({
      where: { userId },
      include: {
        course: true,
      },
    });

    return {
      message: 'Your enrolled courses',
      data: enrollments.map((e) => e.course),
    };
  }
}
