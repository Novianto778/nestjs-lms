import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { ModuleModule } from './modules/module/module.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ProgressModule } from './modules/progress/progress.module';
import { SearchModule } from './modules/search/search.module';
import { SyncModule } from './modules/sync/sync.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    UserModule,
    CoursesModule,
    EnrollmentModule,
    LessonModule,
    ModuleModule,
    StripeModule,
    PaymentModule,
    ProgressModule,
    SearchModule,
    SyncModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
