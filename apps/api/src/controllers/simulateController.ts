import { Request, Response } from 'express';
import { simulateService } from '../services/simulateService';

export const simulateController = {
  simulate: (req: Request, res: Response) => {
    // Placeholder: validate and delegate to service
    simulateService.simulate(req.body);
    res.status(200).json({ message: 'Simulate endpoint placeholder' });
  },
};
