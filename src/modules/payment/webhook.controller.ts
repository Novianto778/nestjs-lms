// src/payment/webhook.controller.ts
import { Controller, Post, Headers, Req, Inject } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { PaymentService } from './payment.service';

@Controller('webhooks')
export class StripeWebhookController {
  constructor(
    @Inject('STRIPE_CLIENT') private stripe: Stripe,
    private config: ConfigService,
    private databaseService: DatabaseService,
    private paymentService: PaymentService,
  ) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: Request & { rawBody: Buffer }, // ensure rawBody is present
  ) {
    const webhookSecret = this.config.get('stripe.webhook_secret');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('⚠️  Webhook signature verification failed:', err.message);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const stripeId = session.id;
      const userId = session.metadata?.userId;
      const courseId = session.metadata?.courseId;
      const amount = session.amount_total;

      if (!courseId || !userId) {
        console.error('⚠️  Metadata is missing courseId or userId');
        return;
      }

      // Enroll user
      const enrollment = await this.databaseService.enrollment.create({
        data: {
          userId,
          courseId,
        },
      });

      // Create payment
      await this.paymentService.createPayment({
        stripeId,
        amount: amount || 0,
        status: 'PAID',
        enrollmentId: enrollment.id,
        paidAt: new Date(),
      });
    }
  }
}
