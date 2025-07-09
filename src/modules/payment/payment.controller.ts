import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { CoursesService } from '../courses/courses.service';
import { PaymentService } from './payment.service';
import { User } from 'src/common/decorators/user.decorators';
import { IUser } from 'src/common/types/user.types';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private courseService: CoursesService,
  ) {}

  @Post('checkout')
  async createCheckoutSession(
    @User() user: IUser,
    @Body() body: { courseId: string },
  ) {
    const course = await this.courseService.findOne(body.courseId);

    if (!course || course.price === 0) {
      throw new Error('Course not found or is free');
    }

    const session = await this.paymentService.createCheckoutSession({
      courseId: course.id,
      courseName: course.title,
      amount: course.price * 100,
      userId: user.id,
    });

    return { url: session.url };
  }

  @Get('course/:courseId')
  async getPaymentByCourseId(@Param('courseId') courseId: string) {
    const result = await this.paymentService.getPaymentByCourseId(courseId);

    return {
      data: result,
      message: 'Success get payment by course id',
      statusCode: HttpStatus.OK,
    };
  }

  @Get('user-status/course/:courseId')
  async getUserPaymentStatus(
    @User() user: IUser,
    @Param('courseId') courseId: string,
  ) {
    const result = await this.paymentService.checkIfUserHasPaidForCourse(
      user.id,
      courseId,
    );

    return {
      data: result,
      message: 'Success get payment status by user id',
      statusCode: HttpStatus.OK,
    };
  }
}
