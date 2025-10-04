/**
 * Error envelope & codes for all endpoints
 * Uniform error structure with HTTP mapping guidance
 */
import { z } from 'zod';

export type ErrorCode = 'VALIDATION_ERROR' | 'DOMAIN_CONSTRAINT' | 'NOT_FOUND' | 'INTERNAL_ERROR';

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  correlationId: string;
  hint?: string;
}

export const ApiErrorSchema = z.object({
  code: z.enum(['VALIDATION_ERROR', 'DOMAIN_CONSTRAINT', 'NOT_FOUND', 'INTERNAL_ERROR']),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  correlationId: z.string(),
  hint: z.string().optional(),
});

/**
 * HTTP mapping guidance:
 * - 400 → VALIDATION_ERROR (validation failures)
 * - 422 → DOMAIN_CONSTRAINT (domain infeasible)
 * - 404 → NOT_FOUND (missing benchmark resource)
 * - 500 → INTERNAL_ERROR (unexpected)
 */
export const ERROR_HTTP_MAPPING: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  DOMAIN_CONSTRAINT: 422,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};
