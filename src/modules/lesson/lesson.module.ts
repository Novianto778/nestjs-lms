import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { LessonProducer } from './queue/lesson.producer';
import { LessonConsumer } from './queue/lesson.consumer';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { UtilitiesModule } from '../utilities/utilities.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { LESSON_QUEUE } from 'src/core/queue/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({ name: LESSON_QUEUE }),
    BullBoardModule.forFeature({ name: LESSON_QUEUE, adapter: BullAdapter }),
    UtilitiesModule,
    CloudinaryModule,
  ],
  providers: [LessonService, LessonProducer, LessonConsumer],
  controllers: [LessonController],
})
export class LessonModule {}
