import { Router } from 'express';
import { ExamController } from '../modules/exams/exam.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', ExamController.getAll);
router.get('/:id', ExamController.getById);
router.post('/', authorize('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'), ExamController.create);
router.post('/results', authorize('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'), ExamController.addResult);
router.post('/results/bulk', authorize('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'), ExamController.bulkAddResults);
router.get('/:examId/results', ExamController.getResults);
router.get('/report-card/:studentId', ExamController.getReportCard);

export default router;
