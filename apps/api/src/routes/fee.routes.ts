import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Fee structures
router.get('/structures', async (req, res) => {
  res.json({ status: 'success', message: 'Get fee structures - TODO' });
});

router.post('/structures', authorize('SUPER_ADMIN', 'PRINCIPAL', 'FINANCE'), async (req, res) => {
  res.json({ status: 'success', message: 'Create fee structure - TODO' });
});

// Fee assignments
router.get('/assignments', async (req, res) => {
  res.json({ status: 'success', message: 'Get fee assignments - TODO' });
});

router.post('/assignments', authorize('SUPER_ADMIN', 'PRINCIPAL', 'FINANCE'), async (req, res) => {
  res.json({ status: 'success', message: 'Assign fees - TODO' });
});

// Payments
router.get('/payments', async (req, res) => {
  res.json({ status: 'success', message: 'Get payments - TODO' });
});

router.post('/payments', authorize('SUPER_ADMIN', 'PRINCIPAL', 'FINANCE', 'STAFF'), async (req, res) => {
  res.json({ status: 'success', message: 'Record payment - TODO' });
});

// Invoices
router.get('/invoices', async (req, res) => {
  res.json({ status: 'success', message: 'Get invoices - TODO' });
});

router.post('/invoices/generate', authorize('SUPER_ADMIN', 'PRINCIPAL', 'FINANCE'), async (req, res) => {
  res.json({ status: 'success', message: 'Generate invoices - TODO' });
});

export default router;
