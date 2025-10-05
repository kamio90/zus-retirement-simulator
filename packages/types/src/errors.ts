/**
 * Error envelope & codes for all endpoints
 * Uniform error structure with HTTP mapping guidance
 */
import { z } from 'zod';

export type ErrorCode = 'VALIDATION_ERROR' | 'DOMAIN_CONSTRAINT' | 'NOT_FOUND' | 'INTERNAL_ERROR';

export type HintCode =
  | 'MISSING_QUARTER_INDEX'
  | 'INVALID_LIFE_EXPECTANCY'
  | 'INVALID_RETIREMENT_AGE'
  | 'INVALID_CONTRIBUTION_BASE'
  | 'OVERLAPPING_PERIODS'
  | 'CLAIM_QUARTER_OUT_OF_RANGE'
  | 'SDZ_NOT_AVAILABLE';

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  correlationId: string;
  hint?: string;
  hintCode?: HintCode;
  suggestions?: Array<{
    action: string;
    label: string;
    params?: Record<string, unknown>;
  }>;
}

export const ApiErrorSchema = z.object({
  code: z.enum(['VALIDATION_ERROR', 'DOMAIN_CONSTRAINT', 'NOT_FOUND', 'INTERNAL_ERROR']),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  correlationId: z.string(),
  hint: z.string().optional(),
  hintCode: z
    .enum([
      'MISSING_QUARTER_INDEX',
      'INVALID_LIFE_EXPECTANCY',
      'INVALID_RETIREMENT_AGE',
      'INVALID_CONTRIBUTION_BASE',
      'OVERLAPPING_PERIODS',
      'CLAIM_QUARTER_OUT_OF_RANGE',
      'SDZ_NOT_AVAILABLE',
    ])
    .optional(),
  suggestions: z
    .array(
      z.object({
        action: z.string(),
        label: z.string(),
        params: z.record(z.unknown()).optional(),
      })
    )
    .optional(),
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
