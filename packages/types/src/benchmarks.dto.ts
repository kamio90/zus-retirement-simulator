import { z } from 'zod';

export const BenchmarksQuerySchema = z.object({
  powiat: z.string().length(7).optional(),
  gender: z.enum(['male', 'female']).optional(),
});

export type BenchmarksQuery = z.infer<typeof BenchmarksQuerySchema>;


export interface BenchmarkResult {
  powiat: string;
  gender: 'male' | 'female';
  averagePension: number;
  sampleSize: number;
}

export interface BenchmarksResponse {
  results: BenchmarkResult[];
  query: BenchmarksQuery;
  generatedAt: string; // ISO date string
}
