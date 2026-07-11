import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  res.json({ status: 'success', message: 'Get timetables - TODO' });
});

router.post('/', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res) => {
  res.json({ status: 'success', message: 'Create timetable - TODO' });
});

router.get('/:id', async (req, res) => {
  res.json({ status: 'success', message: 'Get timetable by ID - TODO' });
});

router.put('/:id', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res) => {
  res.json({ status: 'success', message: 'Update timetable - TODO' });
});

router.delete('/:id', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res) => {
  res.json({ status: 'success', message: 'Delete timetable - TODO' });
});

export default router;
