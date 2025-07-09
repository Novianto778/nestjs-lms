import { Injectable } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { DatabaseService } from 'src/database/database.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    private stripe: StripeService,
    private databaseService: DatabaseService,
  ) {}

  async createCheckoutSession(dto: CreateCheckoutSessionDto) {
    return this.stripe.createCheckoutSession(dto);
  }

  async createPayment(dto: CreatePaymentDto) {
    return this.databaseService.payment.create({
      data: {
        stripeId: dto.stripeId,
        amount: dto.amount || 0,
        status: dto.status,
        enrollmentId: dto.enrollmentId,
        paidAt: dto.paidAt,
      },
    });
  }

  // get payment by enrollment id
  async getPaymentByEnrollmentId(enrollmentId: string) {
    return this.databaseService.payment.findUnique({
      where: { enrollmentId },
    });
  }

  // get payment by user id
  async getPaymentByUserId(userId: string) {
    return this.databaseService.payment.findMany({
      where: { enrollment: { userId } },
    });
  }

  // get payment by course id
  async getPaymentByCourseId(courseId: string) {
    return this.databaseService.payment.findMany({
      where: { enrollment: { courseId } },
    });
  }

  // get payment by status
  async getPaymentByStatus(status: string) {
    return this.databaseService.payment.findMany({
      where: { status },
    });
  }

  async checkIfUserHasPaidForCourse(userId: string, courseId: string) {
    return this.databaseService.payment.findFirst({
      where: { enrollment: { userId, courseId } },
    });
  }
}
