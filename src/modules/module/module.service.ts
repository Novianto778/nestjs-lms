import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModuleService {
  constructor(private databaseService: DatabaseService) {}

  async create(dto: CreateModuleDto) {
    const course = await this.databaseService.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    const module = await this.databaseService.module.create({ data: dto });
    return module;
  }

  async findByCourse(courseId: string) {
    return this.databaseService.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
      },
    });
  }

  async findByCourseWithLesson(courseId: string) {
    return this.databaseService.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findOne(id: string) {
    const module = await this.databaseService.module.findUnique({
      where: { id },
    });
    if (!module) throw new NotFoundException('Module not found');
    return module;
  }

  async update(id: string, dto: UpdateModuleDto) {
    await this.findOne(id);
    return this.databaseService.module.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.databaseService.module.delete({ where: { id } });
  }
}
