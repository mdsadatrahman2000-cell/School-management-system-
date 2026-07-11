import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN', 'PRINCIPAL', 'HR'), async (req, res) => {
  res.json({ status: 'success', message: 'Get all staff - TODO' });
});

router.get('/:id', async (req, res) => {
  res.json({ status: 'success', message: 'Get staff by ID - TODO' });
});

router.post('/', authorize('SUPER_ADMIN', 'PRINCIPAL', 'HR'), async (req, res) => {
  res.json({ status: 'success', message: 'Create staff - TODO' });
});

router.put('/:id', authorize('SUPER_ADMIN', 'PRINCIPAL', 'HR'), async (req, res) => {
  res.json({ status: 'success', message: 'Update staff - TODO' });
});

export default router;
