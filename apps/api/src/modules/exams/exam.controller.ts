import { Request, Response, NextFunction } from 'express';
import { ExamService } from './exam.service';

export class ExamController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId, academicYearId } = req.query;
      const result = await ExamService.getAll(schoolId as string, academicYearId as string);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ExamService.getById(req.params.id);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ExamService.create(req.body);
      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async addResult(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ExamService.addResult(req.body);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async bulkAddResults(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ExamService.bulkAddResults(req.body);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getResults(req: Request, res: Response, next: NextFunction) {
    try {
      const { examId } = req.params;
      const { sectionId } = req.query;
      const result = await ExamService.getResults(examId, sectionId as string);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getReportCard(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const { academicYearId } = req.query;
      const result = await ExamService.getReportCard(studentId, academicYearId as string);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}
