import { z } from 'zod';

export const SimulateInputSchema = z.object({
  birthYear: z.number().int().min(1940).max(new Date().getFullYear() - 16),
  gender: z.enum(['male', 'female']),
  startWorkYear: z.number().int().min(1950).max(new Date().getFullYear()),
  retirementAge: z.number().int().min(60).max(70).default(z.refine((val, ctx) => {
    // Default by gender: 60 for female, 65 for male
    if (ctx.parent.gender === 'female') return 60;
    if (ctx.parent.gender === 'male') return 65;
    return 65;
  })),
  salary: z.number().min(1000).max(100000),
  absenceFactor: z.number().min(0.7).max(1.0).default(0.97),
  powiat: z.string().length(7).optional(), // TERYT code
  accumulatedCapital: z.number().min(0).optional(),
});

export type SimulateInput = z.infer<typeof SimulateInputSchema>;


export interface SimulationResult {
  pensionNominal: number;
  pensionReal: number;
  replacementRate: number;
  capitalTrajectory: number[];
  retirementYear: number;
  retirementQuarter: 1 | 2 | 3 | 4;
  details: Record<string, unknown>;
}
