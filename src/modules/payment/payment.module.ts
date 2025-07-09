import { Module } from '@nestjs/common';
import { StripeModule } from '../stripe/stripe.module';
import { StripeWebhookController } from './webhook.controller';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [StripeModule, CoursesModule],
  controllers: [StripeWebhookController, PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
