import { Request, Response } from 'express';
import { benchmarksService } from '../services/benchmarksService';

export const benchmarksController = {
  getBenchmarks: (req: Request, res: Response) => {
    // Placeholder: delegate to service
    benchmarksService.getBenchmarks();
    res.status(200).json({ message: 'Benchmarks endpoint placeholder' });
  },
};
