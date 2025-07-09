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
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { Role } from 'generated/prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CourseAccessGuard } from '../courses/guards/course-access.guard';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { Public } from 'src/common/decorators/public.decorators';

@Controller('modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  @Roles([Role.INSTRUCTOR, Role.ADMIN])
  async create(@Body() dto: CreateModuleDto) {
    const module = await this.moduleService.create(dto);
    return {
      message: 'Module created successfully',
      data: module,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Get('course/:courseId')
  @Public()
  async findByCourse(@Param('courseId') courseId: string) {
    const modules = await this.moduleService.findByCourse(courseId);
    return {
      message: 'Modules found successfully',
      data: modules,
      statusCode: HttpStatus.OK,
    };
  }

  @Get('course/enrolled/:courseId')
  @UseGuards(CourseAccessGuard)
  @Roles([Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN])
  async findByCourseEnrolled(@Param('courseId') courseId: string) {
    const modules = await this.moduleService.findByCourseWithLesson(courseId);
    return {
      message: 'Modules found successfully',
      data: modules,
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  @Roles([Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN])
  async findOne(@Param('id') id: string) {
    const module = await this.moduleService.findOne(id);
    return {
      message: 'Module found successfully',
      data: module,
      statusCode: HttpStatus.OK,
    };
  }

  @Put(':id')
  @Roles([Role.INSTRUCTOR, Role.ADMIN])
  async update(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
    const module = await this.moduleService.update(id, dto);
    return {
      message: 'Module updated successfully',
      data: module,
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  @Roles([Role.INSTRUCTOR, Role.ADMIN])
  async remove(@Param('id') id: string) {
    const module = await this.moduleService.remove(id);
    return {
      message: 'Module deleted successfully',
      data: module,
      statusCode: HttpStatus.OK,
    };
  }
}
