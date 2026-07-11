import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res) => {
  res.json({ status: 'success', message: 'Get all teachers - TODO' });
});

router.get('/:id', async (req, res) => {
  res.json({ status: 'success', message: 'Get teacher by ID - TODO' });
});

router.post('/', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res) => {
  res.json({ status: 'success', message: 'Create teacher - TODO' });
});

router.put('/:id', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res) => {
  res.json({ status: 'success', message: 'Update teacher - TODO' });
});

export default router;
