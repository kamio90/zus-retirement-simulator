import { Request, Response } from 'express';
import { benchmarksService } from '../services/benchmarksService';
import { BenchmarksQuerySchema, BenchmarksResponse } from '@zus/types';

export const benchmarksController = {
  getBenchmarks: (req: Request, res: Response): void => {
    try {
      // Validate query parameters
      const queryResult = BenchmarksQuerySchema.safeParse(req.query);

      if (!queryResult.success) {
        res.status(400).json({
          error: 'Invalid query parameters',
          details: queryResult.error.issues,
        });
        return;
      }

      const query = queryResult.data;

      // Call service
      const result = benchmarksService.getBenchmarks({
        powiatTeryt: query.powiatTeryt,
        gender: query.gender,
      });

      // Build response
      const response: BenchmarksResponse = {
        nationalAvgPension: result.nationalAvgPension,
        powiatAvgPension: result.powiatAvgPension,
        powiatResolved: result.powiatResolved,
        generatedAt: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
};
