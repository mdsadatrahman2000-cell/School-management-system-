import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public route - anyone can apply
router.post('/apply', async (req, res) => {
  res.json({ status: 'success', message: 'Submit admission application - TODO' });
});

// Protected routes
router.use(authenticate);

router.get('/applications', authorize('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STAFF'), async (req, res) => {
  res.json({ status: 'success', message: 'Get all applications - TODO' });
});

router.get('/applications/:id', async (req, res) => {
  res.json({ status: 'success', message: 'Get application by ID - TODO' });
});

router.put('/applications/:id/approve', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res) => {
  res.json({ status: 'success', message: 'Approve application - TODO' });
});

router.put('/applications/:id/reject', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res) => {
  res.json({ status: 'success', message: 'Reject application - TODO' });
});

router.put('/applications/:id/enroll', authorize('SUPER_ADMIN', 'PRINCIPAL', 'STAFF'), async (req, res) => {
  res.json({ status: 'success', message: 'Enroll student from application - TODO' });
});

export default router;
