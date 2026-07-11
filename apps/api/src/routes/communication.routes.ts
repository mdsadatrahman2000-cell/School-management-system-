import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Messages
router.get('/messages', async (req, res) => {
  res.json({ status: 'success', message: 'Get messages - TODO' });
});

router.post('/messages', async (req, res) => {
  res.json({ status: 'success', message: 'Send message - TODO' });
});

// Notifications
router.get('/notifications', async (req, res) => {
  res.json({ status: 'success', message: 'Get notifications - TODO' });
});

router.put('/notifications/:id/read', async (req, res) => {
  res.json({ status: 'success', message: 'Mark notification as read - TODO' });
});

// Announcements
router.get('/announcements', async (req, res) => {
  res.json({ status: 'success', message: 'Get announcements - TODO' });
});

router.post('/announcements', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res) => {
  res.json({ status: 'success', message: 'Create announcement - TODO' });
});

export default router;
