import { Router } from 'express';
import { StudentController } from '../modules/students/student.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/stats', authorize('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'), StudentController.getStats);
router.get('/', authorize('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STAFF'), StudentController.getAll);
router.get('/:id', StudentController.getById);
router.post('/', authorize('SUPER_ADMIN', 'PRINCIPAL', 'STAFF'), StudentController.create);

export default router;
