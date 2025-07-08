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
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Query } from '@nestjs/common';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Role } from 'generated/prisma/client';
import { Roles } from 'src/common/decorators/roles.decorators';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles([Role.ADMIN])
  async findAll(@Query() pagination: PaginationDto) {
    return {
      data: await this.userService.findAll(pagination),
      message: 'Users found',
      status: HttpStatus.OK,
    };
  }

  @Get(':id')
  @Roles([Role.ADMIN])
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return {
      data: rest,
      message: 'User found',
      status: HttpStatus.OK,
    };
  }

  @Post()
  @Roles([Role.ADMIN])
  async create(@Body() data: CreateUserDto) {
    return {
      data: await this.userService.create(data),
      message: 'User created',
      status: HttpStatus.CREATED,
    };
  }

  @Put(':id')
  @Roles([Role.ADMIN])
  async update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return {
      data: await this.userService.update(id, data),
      message: 'User updated',
      status: HttpStatus.OK,
    };
  }

  @Delete(':id')
  @Roles([Role.ADMIN])
  async delete(@Param('id') id: string) {
    return {
      data: await this.userService.delete(id),
      message: 'User deleted',
      status: HttpStatus.OK,
    };
  }
}
