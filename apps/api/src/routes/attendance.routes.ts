import { Router } from 'express';
import { AttendanceController } from '../modules/attendance/attendance.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/mark', authorize('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STAFF'), AttendanceController.mark);
router.post('/bulk-mark', authorize('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER', 'STAFF'), AttendanceController.bulkMark);
router.get('/section/:sectionId', AttendanceController.getBySection);
router.get('/student/:studentId', AttendanceController.getByStudent);
router.get('/stats', AttendanceController.getStats);

export default router;
