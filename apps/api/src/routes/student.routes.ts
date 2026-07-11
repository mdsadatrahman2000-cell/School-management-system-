import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STAFF'), async (req, res) => {
  res.json({ status: 'success', message: 'Get all students - TODO' });
});

router.get('/:id', async (req, res) => {
  res.json({ status: 'success', message: 'Get student by ID - TODO' });
});

router.post('/', authorize('SUPER_ADMIN', 'PRINCIPAL', 'STAFF'), async (req, res) => {
  res.json({ status: 'success', message: 'Create student - TODO' });
});

router.put('/:id', authorize('SUPER_ADMIN', 'PRINCIPAL', 'STAFF'), async (req, res) => {
  res.json({ status: 'success', message: 'Update student - TODO' });
});

router.get('/:id/attendance', async (req, res) => {
  res.json({ status: 'success', message: 'Get student attendance - TODO' });
});

router.get('/:id/grades', async (req, res) => {
  res.json({ status: 'success', message: 'Get student grades - TODO' });
});

router.get('/:id/fees', async (req, res) => {
  res.json({ status: 'success', message: 'Get student fees - TODO' });
});

export default router;
