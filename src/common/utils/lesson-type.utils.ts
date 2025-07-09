import { LessonType } from 'generated/prisma';

export const getLessonType = (mimeType: string) => {
  if (mimeType.startsWith('text/')) {
    return LessonType.TEXT;
  } else if (mimeType.startsWith('video/')) {
    return LessonType.VIDEO;
  } else if (mimeType.startsWith('application/pdf')) {
    return LessonType.PDF;
  } else {
    return LessonType.TEXT;
  }
};
