import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN'), async (req, res) => {
  res.json({ status: 'success', message: 'Get all schools - TODO' });
});

router.get('/:id', async (req, res) => {
  res.json({ status: 'success', message: 'Get school by ID - TODO' });
});

router.post('/', authorize('SUPER_ADMIN'), async (req, res) => {
  res.json({ status: 'success', message: 'Create school - TODO' });
});

router.put('/:id', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res) => {
  res.json({ status: 'success', message: 'Update school - TODO' });
});

export default router;
