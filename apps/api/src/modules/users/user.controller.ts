import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { AuthRequest } from '../../middleware/auth';

export class UserController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, role, schoolId } = req.query;
      const result = await UserService.getAll({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: search as string,
        role: role as string,
        schoolId: schoolId as string,
      });
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.getById(req.params.id);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.create(req.body);
      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.update(req.params.id, req.body);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.delete(req.params.id);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.updatePassword(req.params.id, req.body.password);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.getStats();
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}
