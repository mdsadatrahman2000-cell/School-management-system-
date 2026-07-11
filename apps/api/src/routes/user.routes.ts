import { Router } from 'express';
import { UserController } from '../modules/users/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema, userIdParamSchema } from '../modules/users/user.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/users/stats - Get user statistics
router.get('/stats', authorize('SUPER_ADMIN', 'PRINCIPAL'), UserController.getStats);

// GET /api/v1/users - Get all users
router.get('/', authorize('SUPER_ADMIN', 'PRINCIPAL'), UserController.getAll);

// GET /api/v1/users/:id - Get user by ID
router.get('/:id', authorize('SUPER_ADMIN', 'PRINCIPAL'), UserController.getById);

// POST /api/v1/users - Create user
router.post('/', authorize('SUPER_ADMIN', 'PRINCIPAL'), validate(createUserSchema), UserController.create);

// PUT /api/v1/users/:id - Update user
router.put('/:id', authorize('SUPER_ADMIN', 'PRINCIPAL'), validate(updateUserSchema), UserController.update);

// DELETE /api/v1/users/:id - Delete user
router.delete('/:id', authorize('SUPER_ADMIN', 'PRINCIPAL'), UserController.delete);

// PUT /api/v1/users/:id/password - Update password
router.put('/:id/password', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res, next) => {
  try {
    if (!req.body.password || req.body.password.length < 8) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 8 characters' });
    }
    const result = await UserController.updatePassword(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;
