import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/attendance', async (req, res) => {
  res.json({ status: 'success', message: 'Get attendance reports - TODO' });
});

router.get('/academic', async (req, res) => {
  res.json({ status: 'success', message: 'Get academic reports - TODO' });
});

router.get('/financial', authorize('SUPER_ADMIN', 'PRINCIPAL', 'FINANCE'), async (req, res) => {
  res.json({ status: 'success', message: 'Get financial reports - TODO' });
});

router.get('/custom', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res) => {
  res.json({ status: 'success', message: 'Get custom reports - TODO' });
});

export default router;
