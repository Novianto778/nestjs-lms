// cloudinary.service.ts
import { Inject, Injectable } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';
import { ConfigService } from '@nestjs/config';

type CloudinaryType = typeof cloudinary;

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: CloudinaryType,
    private readonly configService: ConfigService,
  ) {}

  async uploadImage(buffer: Buffer): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = this.cloudinary.uploader.upload_stream(
        {
          folder: this.configService.get<string>('cloudinary.folder'),
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            reject(new Error(error.message));
          }
          resolve(result);
        },
      );

      stream.end(buffer); // Pass the buffer here
    });
  }

  async deleteImage(publicId: string) {
    return this.cloudinary.uploader.destroy(publicId);
  }
}
