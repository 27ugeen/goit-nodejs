import { Router } from 'express';
import { authController } from './auth.controller';

const router = Router();

router.post(
  '/register',
  authController.validateRegisterUser,
  authController.registerUser,
);

router.get('/register', authController.getAllUsers);

router.post('/sign-in', authController.validateSignIn, authController.signIn);

router.patch('/sign-out', authController.authorize, authController.signOut);

export const authRouter = router;
