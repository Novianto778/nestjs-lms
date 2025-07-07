import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CoursesModule } from './modules/courses/courses.module';

@Module({
  imports: [CoreModule, AuthModule, UserModule, CoursesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
