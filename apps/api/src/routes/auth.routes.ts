import { Router } from 'express';
import { AuthController } from '../modules/auth/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from '../modules/auth/auth.validation';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refreshToken);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);

export default router;
