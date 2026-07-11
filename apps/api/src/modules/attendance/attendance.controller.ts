import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from './attendance.service';
import { AuthRequest } from '../../middleware/auth';

export class AttendanceController {
  static async mark(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await AttendanceService.mark({
        ...req.body,
        markedBy: req.user!.id,
      });
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async bulkMark(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await AttendanceService.bulkMark({
        ...req.body,
        markedBy: req.user!.id,
      });
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getBySection(req: Request, res: Response, next: NextFunction) {
    try {
      const { sectionId } = req.params;
      const { date } = req.query;
      const result = await AttendanceService.getBySection(sectionId, date as string || new Date().toISOString().split('T')[0]);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getByStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const { startDate, endDate } = req.query;
      const result = await AttendanceService.getByStudent(
        studentId,
        startDate as string,
        endDate as string
      );
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { sectionId, academicYearId } = req.query;
      const result = await AttendanceService.getStats(
        sectionId as string,
        academicYearId as string
      );
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}
