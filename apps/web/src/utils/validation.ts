/**
 * Form validation utilities using Zod
 */
import { SimulateRequestSchema } from '@zus/types';
import type { ZodError } from 'zod';

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
