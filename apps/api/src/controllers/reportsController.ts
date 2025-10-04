import { Request, Response } from 'express';
import { reportsService } from '../services/reportsService';

export const reportsController = {
  getReports: (req: Request, res: Response) => {
    // Placeholder: delegate to service
    reportsService.getReports();
    res.status(200).json({ message: 'Reports endpoint placeholder' });
  },
};
