import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { User } from 'src/common/decorators/user.decorators';
import { IUser } from 'src/common/types/user.types';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { Role } from 'generated/prisma';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MaxFileCountValidationPipe } from 'src/common/pipes/max-file-count-validation/max-file-count-validation.pipe';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    const { data, meta } = await this.coursesService.findAll(pagination);
    return {
      data,
      meta,
      message: 'Courses fetched',
      status: HttpStatus.OK,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const course = await this.coursesService.findOne(id);
    if (!course) throw new NotFoundException('Course not found');
    return {
      data: course,
      message: 'Course found',
      status: HttpStatus.OK,
    };
  }

  @Post()
  @UseInterceptors(FilesInterceptor(`images`))
  @Roles([Role.INSTRUCTOR])
  async create(
    @User() user: IUser,
    @Body() data: CreateCourseDto,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new FileTypeValidator({ fileType: `.(png|jpeg|jpg)` }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
        ],
      }),
      new MaxFileCountValidationPipe(1),
    )
    files: Express.Multer.File[],
  ) {
    const course = await this.coursesService.create(
      {
        ...data,
        instructorId: user.id,
      },
      files,
    );
    return {
      data: course,
      message: 'Course created',
      status: HttpStatus.CREATED,
    };
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor(`images`))
  @Roles([Role.INSTRUCTOR])
  async update(
    @Param('id') id: string,
    @User() user: IUser,
    @Body() data: UpdateCourseDto,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new FileTypeValidator({ fileType: `.(png|jpeg|jpg)` }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
        ],
      }),
      new MaxFileCountValidationPipe(1),
    )
    files: Express.Multer.File[],
  ) {
    const course = await this.coursesService.update(
      id,
      {
        ...data,
        instructorId: user.id,
      },
      files,
    );
    return {
      data: course,
      message: 'Course updated',
      status: HttpStatus.OK,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const course = await this.coursesService.delete(id);
    return {
      data: course,
      message: 'Course deleted',
      status: HttpStatus.OK,
    };
  }

  @Patch(':id/publish')
  @Roles([Role.ADMIN, Role.INSTRUCTOR])
  async setPublished(
    @Param('id') id: string,
    @Body() data: { isPublished: boolean },
  ) {
    const course = await this.coursesService.setPublished(id, data.isPublished);
    return {
      data: course,
      message: 'Course published',
      status: HttpStatus.OK,
    };
  }
}
