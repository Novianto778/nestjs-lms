import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export const CLOUDINARY = 'CLOUDINARY';

export const CloudinaryProvider: Provider = {
  provide: CLOUDINARY,
  useFactory: (configService: ConfigService) => {
    cloudinary.config({
      cloud_name: configService.get('cloudinary.cloud_name'),
      api_key: configService.get('cloudinary.api_key'),
      api_secret: configService.get('cloudinary.api_secret'),
    });

    return cloudinary;
  },
  inject: [ConfigService], // inject config service so it can be used in the factory function
};
