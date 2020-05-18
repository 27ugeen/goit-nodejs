import multer from 'multer';
import path from 'path';
import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';
import fs, { promises as fsPromises } from 'fs';
import { avatar } from './buildAvatar';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.UNCOMPRESSED_IMAGES_FOLDER);
  },
  filename: function (req, file, cb) {
    const { ext } = path.parse(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

export const upload = multer({ storage });

// ==========================================

export async function compressImage(req, res, next) {
  const { destination, filename } = req.file || {};

  if (!destination) {
    next();
  }

  const COMPRESSING_DESTINATION = process.env.COMPRESSED_IMAGES_FOLDER;
  // const COMPRESSING_DESTINATION = 'public';

  await imagemin([`${destination}/${filename}`], {
    destination: COMPRESSING_DESTINATION,
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8],
      }),
    ],
  });

  req.file.path = path.join(COMPRESSING_DESTINATION, filename);
  // console.log(req.file.path);

  await fsPromises.unlink(`${destination}/${filename}`);

  next();
}

// ===========================================

export async function buildAvatar(req, res, next) {
  const buffer = await avatar.create();

  const avatarName = `${Date.now()}.png`;
  const avatarPath = path.join(__dirname, `./../../temp/${avatarName}`);

  fs.writeFile(avatarPath, buffer, err => {
    if (err) throw err;
  });

  const destinationUncompressed = process.env.UNCOMPRESSED_IMAGES_FOLDER;
  if (!destinationUncompressed) {
    next();
  }

  const COMPRESSING_DESTINATION = process.env.COMPRESSED_IMAGES_FOLDER;
  // const COMPRESSING_DESTINATION = 'public';

  await imagemin([`${destinationUncompressed}/${avatarName}`], {
    destination: COMPRESSING_DESTINATION,
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8],
      }),
    ],
  });

  req.file = path.join(avatarName);

  await fsPromises.unlink(`${destinationUncompressed}/${avatarName}`);

  next();
}
