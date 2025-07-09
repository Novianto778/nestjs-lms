import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  constructor(@Inject('STRIPE_CLIENT') private readonly stripe: Stripe) {}

  async createCheckoutSession(params: {
    courseId: string;
    courseName: string;
    amount: number; // in cents
    userId: string;
  }) {
    return this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: params.courseName,
            },
            unit_amount: params.amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId: params.courseId,
        userId: params.userId,
      },
      success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });
  }
}
