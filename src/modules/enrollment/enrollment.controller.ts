import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from 'generated/prisma';
import { Roles } from 'src/common/decorators/roles.decorators';
import { User } from 'src/common/decorators/user.decorators';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { EnrollmentService } from './enrollment.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Roles([Role.STUDENT], 'Only students can enroll in courses')
  @Post()
  enroll(@User('id') userId: string, @Body() dto: EnrollCourseDto) {
    return this.enrollmentService.enroll(userId, dto.courseId);
  }

  @Get('my-courses')
  @Roles([Role.STUDENT])
  getMyCourses(@User('id') userId: string) {
    return this.enrollmentService.getMyCourses(userId);
  }

  @Roles([Role.ADMIN, Role.INSTRUCTOR])
  @Get('students/:courseId')
  getCourseStudents(@Param('courseId') courseId: string) {
    return this.enrollmentService.getCourseStudents(courseId);
  }
}
