/**
 * DTOs and schemas for GET /api/benchmarks
 */
import { z } from 'zod';

// Query schema
export const BenchmarksQuerySchema = z
  .object({
    powiatTeryt: z
      .string()
      .length(7, 'TERYT code must be exactly 7 characters')
      .regex(/^\d{7}$/, 'TERYT code must contain only digits')
      .optional(),
    gender: z.enum(['M', 'F']).optional(),
  })
  .strict();

export type BenchmarksQuery = z.infer<typeof BenchmarksQuerySchema>;

// Response schemas
export const BenchmarksResponseSchema = z.object({
  nationalAvgPension: z.number().min(0, 'National average pension cannot be negative'),
  powiatAvgPension: z.number().min(0, 'Powiat average pension cannot be negative').optional(),
  powiatResolved: z
    .object({
      name: z.string(),
      teryt: z.string().length(7),
    })
    .optional(),
  generatedAt: z.string().datetime(),
});

export type BenchmarksResponse = z.infer<typeof BenchmarksResponseSchema>;

// Legacy support - keep for backward compatibility
/** @deprecated Use BenchmarksQuery instead */
export interface BenchmarkResult {
  powiat: string;
  gender: 'male' | 'female';
  averagePension: number;
  sampleSize: number;
}
