import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.services';
import { CloudinaryProvider } from './cloudinary.provider';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  providers: [CloudinaryService, CloudinaryProvider, ConfigService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
