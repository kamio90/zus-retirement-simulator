import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiError, ERROR_HTTP_MAPPING } from '@zus/types';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const correlationId = uuidv4();

  logger.error(`[${correlationId}] ${err.message}`);

  const apiError: ApiError = {
    code: 'INTERNAL_ERROR',
    message: err.message || 'An unexpected error occurred',
    correlationId,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Correlation-Id', correlationId);
  res.status(ERROR_HTTP_MAPPING['INTERNAL_ERROR']).json(apiError);
}
