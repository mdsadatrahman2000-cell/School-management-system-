import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  res.json({ status: 'success', message: 'Get all exams - TODO' });
});

router.post('/', authorize('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'), async (req, res) => {
  res.json({ status: 'success', message: 'Create exam - TODO' });
});

router.get('/:id', async (req, res) => {
  res.json({ status: 'success', message: 'Get exam by ID - TODO' });
});

router.put('/:id', authorize('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'), async (req, res) => {
  res.json({ status: 'success', message: 'Update exam - TODO' });
});

// Results
router.get('/:id/results', async (req, res) => {
  res.json({ status: 'success', message: 'Get exam results - TODO' });
});

router.post('/:id/results', authorize('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'), async (req, res) => {
  res.json({ status: 'success', message: 'Add exam results - TODO' });
});

export default router;
