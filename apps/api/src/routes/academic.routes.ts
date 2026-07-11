import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Classes
router.get('/classes', async (req, res) => {
  res.json({ status: 'success', message: 'Get all classes - TODO' });
});

router.post('/classes', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res) => {
  res.json({ status: 'success', message: 'Create class - TODO' });
});

// Sections
router.get('/sections', async (req, res) => {
  res.json({ status: 'success', message: 'Get all sections - TODO' });
});

router.post('/sections', authorize('SUPER_ADMIN', 'PRINCIPAL'), async (req, res) => {
  res.json({ status: 'success', message: 'Create section - TODO' });
});

// Subjects
router.get('/subjects', async (req, res) => {
  res.json({ status: 'success', message: 'Get all subjects - TODO' });
});

router.post('/subjects', authorize('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'), async (req, res) => {
  res.json({ status: 'success', message: 'Create subject - TODO' });
});

// Enrollments
router.get('/enrollments', async (req, res) => {
  res.json({ status: 'success', message: 'Get all enrollments - TODO' });
});

router.post('/enrollments', authorize('SUPER_ADMIN', 'PRINCIPAL', 'STAFF'), async (req, res) => {
  res.json({ status: 'success', message: 'Create enrollment - TODO' });
});

export default router;
