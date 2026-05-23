import multer from 'multer';
import { Request } from 'express';

const ALLOWED_MIME_TYPES = [
  // PDF
  'application/pdf',
  // Plain text
  'text/plain',
  'text/csv',
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type: ${file.mimetype}. Allowed types: PDF, text, and images.`
        )
      );
    }
  },
});
