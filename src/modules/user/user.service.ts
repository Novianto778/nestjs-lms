import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

// src/user/user.service.ts
@Injectable()
export class UserService {
  constructor(private databaseService: DatabaseService) {}

  async findByEmail(email: string) {
    return this.databaseService.user.findUnique({ where: { email } });
  }

  async create(data: { email: string; password: string; name: string }) {
    return this.databaseService.user.create({ data });
  }

  async findById(id: string) {
    return this.databaseService.user.findUnique({ where: { id } });
  }
}
