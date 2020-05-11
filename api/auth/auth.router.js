import { Router } from 'express';
import { authController } from './auth.controller';

const router = Router();

router.post(
  '/register',
  authController.validateRegisterUser,
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

export const authRouter = router;
