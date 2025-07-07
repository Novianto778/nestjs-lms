import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { slugify } from 'src/common/utils/slug.utils';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { createMeta } from 'src/common/utils/pagination.utils';
import { Prisma } from 'generated/prisma';

@Injectable()
export class CoursesService {
  constructor(private databaseService: DatabaseService) {}

  async findAll(pagination: PaginationDto) {
    const { page, limit, search } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [data, total] = await Promise.all([
      this.databaseService.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { instructor: true },
      }),
      this.databaseService.course.count({ where }),
    ]);

    return {
      message: 'Courses fetched',
      data,
      meta: createMeta({ page, limit, total }),
    };
  }

  async findOne(id: string) {
    return this.databaseService.course.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return this.databaseService.course.findUnique({ where: { slug } });
  }

  async create(data: CreateCourseDto) {
    const slug = slugify(data.title);
    return this.databaseService.course.create({
      data: { ...data, slug },
    });
  }

  async update(id: string, data: UpdateCourseDto) {
    return this.databaseService.course.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.databaseService.course.delete({ where: { id } });
  }
}
