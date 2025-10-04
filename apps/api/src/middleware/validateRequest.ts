import { Request, Response, NextFunction } from 'express';

export function validateRequest(req: Request, res: Response, next: NextFunction) {
  // Placeholder for request validation (e.g. Zod)
  next();
}
