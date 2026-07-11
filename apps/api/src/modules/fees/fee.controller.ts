import { Request, Response, NextFunction } from 'express';
import { FeeService } from './fee.service';
import { AuthRequest } from '../../middleware/auth';

export class FeeController {
  static async getStructures(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.query;
      const result = await FeeService.getStructures(schoolId as string);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async createStructure(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FeeService.createStructure(req.body);
      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async assignFee(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FeeService.assignFee(req.body);
      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId, status } = req.query;
      const result = await FeeService.getAssignments(studentId as string, status as string);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async recordPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await FeeService.recordPayment({
        ...req.body,
        receivedBy: req.user!.id,
      });
      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { feeAssignmentId } = req.query;
      const result = await FeeService.getPayments(feeAssignmentId as string);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.query;
      const result = await FeeService.getStats(schoolId as string);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}
