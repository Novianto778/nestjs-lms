import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Role } from 'generated/prisma/client';
import { Roles } from 'src/common/decorators/roles.decorators';
import { UploadFile } from 'src/common/decorators/upload-file-decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonService } from './lesson.service';
import { Public } from 'src/common/decorators/public.decorators';

@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @UseInterceptors(FilesInterceptor(`files`))
  @Public()
  @Post()
  // @Roles(
  //   [Role.INSTRUCTOR, Role.ADMIN],
  //   'Only instructors and admins can create lessons',
  // )
  async create(
    @Body() dto: CreateLessonDto,
    @UploadFile({
      fileIsRequired: false,
      maxSize: 1024 * 1024 * 5, // 5MB
      maxCount: 1,
      fileType: '.(txt|pdf|mp4|mp3)',
    })
    files: Express.Multer.File[],
  ) {
    const lesson = await this.lessonService.create(dto, files);
    return {
      message: 'Lesson created successfully',
      lesson,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Get('module/:moduleId')
  @Roles([Role.ADMIN, Role.INSTRUCTOR, Role.STUDENT])
  async findByModule(@Param('moduleId') moduleId: string) {
    const lessons = await this.lessonService.findByModule(moduleId);
    return {
      message: 'Lessons found successfully',
      lessons,
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  @Roles([Role.ADMIN, Role.INSTRUCTOR, Role.STUDENT])
  async findOne(@Param('id') id: string) {
    const lesson = await this.lessonService.findOne(id);
    return {
      message: 'Lesson found successfully',
      lesson,
      statusCode: HttpStatus.OK,
    };
  }

  @Put(':id')
  @Roles(
    [Role.INSTRUCTOR, Role.ADMIN],
    'Only instructors and admins can update lessons',
  )
  async update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    const lesson = await this.lessonService.update(id, dto);
    return {
      message: 'Lesson updated successfully',
      lesson,
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  @Roles(
    [Role.INSTRUCTOR, Role.ADMIN],
    'Only instructors and admins can delete lessons',
  )
  async remove(@Param('id') id: string) {
    const lesson = await this.lessonService.remove(id);
    return {
      message: 'Lesson deleted successfully',
      lesson,
      statusCode: HttpStatus.OK,
    };
  }
}
