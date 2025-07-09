// src/stripe/stripe.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { StripeService } from './stripe.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'STRIPE_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Stripe(config.get<string>('stripe.secret_key')!, {
          apiVersion: '2025-06-30.basil',
        }),
    },
    StripeService,
  ],
  exports: ['STRIPE_CLIENT', StripeService],
})
export class StripeModule {}
