/**
 * Form validation utilities using Zod
 */
import { z } from 'zod';
import type { ZodError } from 'zod';

// Inline SimulateRequestSchema for Vite compatibility
const SimulateRequestSchema = z.object({
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()),
  gender: z.enum(['M', 'F']),
  startWorkYear: z.number().int().min(1950),
  currentGrossMonthly: z.number().positive(),
  retirementAge: z.number().int().min(60).max(75),
  accumulatedInitialCapital: z.number().nonnegative().optional().default(0),
  subAccountBalance: z.number().nonnegative().optional().default(0),
  absenceFactor: z.number().min(0).max(1).optional().default(1),
  claimMonth: z.number().int().min(1).max(12).optional().default(6),
}).strict();

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Extract validation errors from Zod error
 */
export function extractValidationErrors(error: ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

/**
 * Validate form data using SimulateRequestSchema
 */
export function validateSimulateForm(data: unknown): {
  success: boolean;
  data?: unknown;
  errors?: ValidationError[];
} {
  const result = SimulateRequestSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: extractValidationErrors(result.error),
  };
}
