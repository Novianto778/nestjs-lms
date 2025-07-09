import {
  MaxFileSizeValidator,
  ParseFilePipe,
  FileTypeValidator,
  UploadedFiles,
} from '@nestjs/common';
import { MaxFileCountValidationPipe } from '../pipes/max-file-count-validation/max-file-count-validation.pipe';

export function UploadFile({
  fileIsRequired = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  maxCount = 1,
  fileType = '.(jpg|jpeg|png)',
}: {
  fileIsRequired?: boolean;
  maxSize?: number;
  maxCount?: number;
  fileType?: string;
} = {}) {
  return UploadedFiles(
    new ParseFilePipe({
      fileIsRequired,
      validators: [
        new FileTypeValidator({ fileType }),
        new MaxFileSizeValidator({ maxSize }),
      ],
    }),
    new MaxFileCountValidationPipe(maxCount),
  );
}
