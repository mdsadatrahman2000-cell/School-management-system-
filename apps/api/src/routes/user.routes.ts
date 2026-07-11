import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/users - Get all users (admin only)
router.get('/', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res) => {
  res.json({ status: 'success', message: 'Get all users - TODO' });
});

// GET /api/v1/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  res.json({ status: 'success', message: 'Get user by ID - TODO' });
});

// POST /api/v1/users - Create user (admin only)
router.post('/', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res) => {
  res.json({ status: 'success', message: 'Create user - TODO' });
});

// PUT /api/v1/users/:id - Update user
router.put('/:id', async (req, res) => {
  res.json({ status: 'success', message: 'Update user - TODO' });
});

// DELETE /api/v1/users/:id - Delete user (admin only)
router.delete('/:id', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res) => {
  res.json({ status: 'success', message: 'Delete user - TODO' });
});

export default router;
