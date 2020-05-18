import { Router } from 'express';
import { authController } from './auth.controller';
import { buildAvatar } from '../user/upload.middlewares';
import { upload, compressImage } from '../user/upload.middlewares';

const router = Router();

router.post(
  '/register',
  authController.validateRegisterUser,
  buildAvatar,
  authController.registerUser,
);

router.get('/', authController.getAllUsers);

router.get(
  '/current',
  authController.authorizeUser,
  authController.getCurrentUser,
);

router.post(
  '/login',
  authController.validateLoginUser,
  authController.loginUser,
);

router.patch(
  '/logout',
  authController.authorizeUser,
  authController.logoutUser,
);

router.patch(
  '/avatars',
  authController.authorizeUser,
  upload.single('avatar'),
  compressImage,
  authController.updateUserAvatar,
);

export const authRouter = router;
