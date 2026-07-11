import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN', 'PRINCIPAL', 'STAFF'), async (req, res) => {
  res.json({ status: 'success', message: 'Get all guardians - TODO' });
});

router.get('/:id', async (req, res) => {
  res.json({ status: 'success', message: 'Get guardian by ID - TODO' });
});

router.post('/', authorize('SUPER_ADMIN', 'PRINCIPAL', 'STAFF'), async (req, res) => {
  res.json({ status: 'success', message: 'Create guardian - TODO' });
});

router.put('/:id', authorize('SUPER_ADMIN', 'PRINCIPAL', 'STAFF'), async (req, res) => {
  res.json({ status: 'success', message: 'Update guardian - TODO' });
});

export default router;
