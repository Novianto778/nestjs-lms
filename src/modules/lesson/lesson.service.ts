import { Injectable, NotFoundException } from '@nestjs/common';
import { getLessonType } from 'src/common/utils/lesson-type.utils';
import { DatabaseService } from 'src/database/database.service';
import { CloudinaryService } from '../cloudinary/cloudinary.services';
import { FileService } from '../utilities/file/file.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UploadLessonFileDto } from './dto/upload-lesson-file.dto';
import { LessonProducer } from './queue/lesson.producer';

@Injectable()
export class LessonService {
  constructor(
    private databaseService: DatabaseService,
    private lessonProducer: LessonProducer,
    private fileService: FileService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateLessonDto, files: Express.Multer.File[]) {
    const contentUrl = files.length > 0 ? 'processing' : null;
    let contentType = null;
    if (files.length > 0) {
      contentType = files?.[0]?.mimetype;
    }
    const lessonType = getLessonType(contentType as string);

    const lesson = await this.databaseService.lesson.create({
      data: { ...dto, contentUrl, contentType: lessonType },
    });

    for (const file of files) {
      await this.lessonProducer.uploadLessonFile({
        base64File: this.fileService.bufferToBase64(file.buffer),
        mimeType: file.mimetype,
        lessonId: lesson.id,
      });
    }

    return lesson;
  }

  async createLessonFile(dto: UploadLessonFileDto) {
    const buffer = this.fileService.base64ToBuffer(dto.base64File);
    const result = await this.cloudinaryService.uploadImage(buffer);

    return this.databaseService.lesson.update({
      where: { id: dto.lessonId },
      data: {
        contentUrl: result.secure_url,
      },
    });
  }

  async findByModule(moduleId: string) {
    return this.databaseService.lesson.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const lesson = await this.databaseService.lesson.findUnique({
      where: { id },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async update(id: string, dto: UpdateLessonDto) {
    await this.findOne(id);
    return this.databaseService.lesson.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.databaseService.lesson.delete({ where: { id } });
  }
}
