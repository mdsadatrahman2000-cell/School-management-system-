import { Router } from 'express';
import { FeeController } from '../modules/fees/fee.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/structures', FeeController.getStructures);
router.post('/structures', authorize('SUPER_ADMIN', 'PRINCIPAL', 'FINANCE'), FeeController.createStructure);
router.post('/assign', authorize('SUPER_ADMIN', 'PRINCIPAL', 'FINANCE'), FeeController.assignFee);
router.get('/assignments', FeeController.getAssignments);
router.post('/payments', authorize('SUPER_ADMIN', 'PRINCIPAL', 'FINANCE', 'STAFF'), FeeController.recordPayment);
router.get('/payments', FeeController.getPayments);
router.get('/stats', FeeController.getStats);

export default router;
