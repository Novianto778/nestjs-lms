import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
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
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  async create(@User() user: IUser, @Body() data: CreateCourseDto) {
    const course = await this.coursesService.create({
      ...data,
      instructorId: user.id,
    });
    return {
      data: course,
      message: 'Course created',
      status: HttpStatus.CREATED,
    };
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  async update(
    @Param('id') id: string,
    @User() user: IUser,
    @Body() data: UpdateCourseDto,
  ) {
    const course = await this.coursesService.update(id, {
      ...data,
      instructorId: user.id,
    });
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
}
