import { Request, Response, NextFunction } from 'express';
import { sessionModel } from '../models/session.model';

export const attendanceController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, startDate, endDate } = req.query;
      const records = await sessionModel.getAttendanceRecords({
        userId: userId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      res.json(records);
    } catch (error) {
      next(error);
    }
  },
};
