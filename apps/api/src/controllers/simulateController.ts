import { Request, Response } from 'express';
import { SimulateRequestSchema, ApiError, ERROR_HTTP_MAPPING } from '@zus/types';
import { simulateService } from '../services/simulateService';
import { ZodError } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export const simulateController = {
  simulate: (req: Request, res: Response): void => {
    const correlationId = uuidv4();

    try {
      // Validate request using Zod schema
      const validatedRequest = SimulateRequestSchema.parse(req.body);

      // Delegate to service
      const result = simulateService.simulate(validatedRequest);

      // Return successful response
      res.status(200).json(result);
    } catch (error) {
      // Handle validation errors from Zod
      if (error instanceof ZodError) {
        const apiError: ApiError = {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          details: {
            issues: error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
          correlationId,
          hint: 'Check the request body and ensure all required fields are provided with valid values',
        };
        res.status(ERROR_HTTP_MAPPING['VALIDATION_ERROR']).json(apiError);
        return;
      }

      // Handle other errors
      const apiError: ApiError = {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        correlationId,
      };
      res.status(ERROR_HTTP_MAPPING['INTERNAL_ERROR']).json(apiError);
    }
  },
};
