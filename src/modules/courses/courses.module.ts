import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { UtilitiesModule } from '../utilities/utilities.module';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { COURSE_QUEUE } from 'src/core/queue/queue.constants';
import { CloudinaryModule } from 'src/modules/cloudinary/cloudinary.module';
import { CourseProducer } from './queue/course.producer';
import { CourseConsumer } from './queue/course.consumer';

@Module({
  imports: [
    BullModule.registerQueue({ name: COURSE_QUEUE }),
    BullBoardModule.forFeature({ name: COURSE_QUEUE, adapter: BullAdapter }),
    UtilitiesModule,
    CloudinaryModule,
  ],
  providers: [CoursesService, CourseProducer, CourseConsumer],
  controllers: [CoursesController],
})
export class CoursesModule {}
