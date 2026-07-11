import { Request, Response, NextFunction } from 'express';
import { StudentService } from './student.service';

export class StudentController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, classId, sectionId, schoolId } = req.query;
      const result = await StudentService.getAll({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: search as string,
        classId: classId as string,
        sectionId: sectionId as string,
        schoolId: schoolId as string,
      });
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await StudentService.getById(req.params.id);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await StudentService.create(req.body);
      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.query;
      const result = await StudentService.getStats(schoolId as string);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}
