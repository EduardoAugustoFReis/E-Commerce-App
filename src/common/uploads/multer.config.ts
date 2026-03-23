import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);

      const fileExt = extname(file.originalname);

      callback(null, `${uniqueName}${fileExt}`);
    },
  }),
};
