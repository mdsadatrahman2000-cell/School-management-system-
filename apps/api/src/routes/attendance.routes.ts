import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/mark', authorize('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STAFF'), async (req, res) => {
  res.json({ status: 'success', message: 'Mark attendance - TODO' });
});

router.get('/class/:classId', async (req, res) => {
  res.json({ status: 'success', message: 'Get class attendance - TODO' });
});

router.get('/student/:studentId', async (req, res) => {
  res.json({ status: 'success', message: 'Get student attendance - TODO' });
});

router.put('/:id', authorize('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'), async (req, res) => {
  res.json({ status: 'success', message: 'Update attendance - TODO' });
});

export default router;
