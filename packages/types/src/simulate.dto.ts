/**
 * DTOs and schemas for POST /api/simulate
 */
import { z } from 'zod';

// Input schema with cross-field validation
export const SimulateRequestSchema = z
  .object({
    birthYear: z
      .number()
      .int()
      .min(1940, 'Birth year must be 1940 or later')
      .max(new Date().getFullYear() - 16, 'Must be at least 16 years old'),
    gender: z.enum(['M', 'F'], {
      errorMap: () => ({ message: 'Gender must be "M" or "F"' }),
    }),
    startWorkYear: z
      .number()
      .int()
      .min(1950, 'Start work year must be 1950 or later')
      .max(new Date().getFullYear(), 'Start work year cannot be in the future'),
    currentGrossMonthly: z
      .number()
      .min(1000, 'Salary must be at least 1000 PLN')
      .max(100000, 'Salary must be at most 100000 PLN'),
    retirementAge: z
      .number()
      .int()
      .min(50, 'Retirement age must be at least 50')
      .max(80, 'Retirement age must be at most 80')
      .optional(),
    accumulatedInitialCapital: z.number().min(0, 'Initial capital cannot be negative').optional(),
    subAccountBalance: z.number().min(0, 'Sub-account balance cannot be negative').optional(),
    absenceFactor: z
      .number()
      .min(0.7, 'Absence factor must be at least 0.7')
      .max(1.0, 'Absence factor must be at most 1.0')
      .default(1.0),
    claimMonth: z
      .number()
      .int()
      .min(1, 'Claim month must be between 1 and 12')
      .max(12, 'Claim month must be between 1 and 12')
      .default(6),
    powiatTeryt: z
      .string()
      .length(7, 'TERYT code must be exactly 7 characters')
      .regex(/^\d{7}$/, 'TERYT code must contain only digits')
      .optional(),
  })
  .strict() // Disallow unknown fields
  .refine(
    (data) => {
      // Default retirementAge based on gender if not provided
      const retirementAge = data.retirementAge ?? (data.gender === 'F' ? 60 : 65);
      return retirementAge >= (data.gender === 'F' ? 50 : 50);
    },
    {
      message: 'Retirement age must meet minimum requirements for gender',
      path: ['retirementAge'],
    }
  )
  .refine(
    (data) => {
      // Chronological check: startWorkYear must be after birthYear
      return data.startWorkYear >= data.birthYear + 16;
    },
    {
      message: 'Start work year must be at least 16 years after birth year',
      path: ['startWorkYear'],
    }
  )
  .refine(
    (data) => {
      // Chronological check: entitlementYear must be after startWorkYear
      const retirementAge = data.retirementAge ?? (data.gender === 'F' ? 60 : 65);
      const entitlementYear = data.birthYear + retirementAge;
      return entitlementYear >= data.startWorkYear;
    },
    {
      message: 'Retirement year must be after start work year',
      path: ['retirementAge'],
    }
  )
  .transform((data) => {
    // Apply default retirementAge based on gender if not provided
    if (data.retirementAge === undefined) {
      data.retirementAge = data.gender === 'F' ? 60 : 65;
    }
    return data as typeof data & { retirementAge: number };
  });

export type SimulateRequest = z.infer<typeof SimulateRequestSchema>;

// Output schema with validation
export const SimulationResultSchema = z.object({
  scenario: z.object({
    retirementAge: z.number().int().min(50).max(80),
    retirementYear: z.number().int().min(1950),
    claimMonth: z.number().int().min(1).max(12),
    gender: z.enum(['M', 'F']),
  }),
  monthlyPensionNominal: z.number().min(0, 'Monthly pension nominal cannot be negative'),
  monthlyPensionRealToday: z.number().min(0, 'Monthly pension real cannot be negative'),
  replacementRate: z
    .number()
    .min(0, 'Replacement rate must be between 0 and 1')
    .max(1, 'Replacement rate must be between 0 and 1'),
  capitalTrajectory: z
    .array(
      z.object({
        year: z.number().int(),
        annualWage: z.number().min(0),
        annualContribution: z.number().min(0),
        annualValorizationIndex: z.number(),
        cumulativeCapitalAfterAnnual: z.number().min(0),
      })
    )
    .min(1, 'Capital trajectory must have at least one entry'),
  finalization: z.object({
    quarterIndexId: z.string(),
    compoundedResult: z.number().min(0),
  }),
  assumptions: z.object({
    annualValorizationSetId: z.string(),
    quarterlySetId: z.string(),
    sdżTableId: z.string(),
    cpiVintage: z.string(),
    wageVintage: z.string(),
    providerKind: z.enum(['DeterministicDemo', 'OfficialTables']),
  }),
  explainers: z.array(z.string()).optional(),
});

export type SimulationResult = z.infer<typeof SimulationResultSchema>;

// Legacy support - keep for backward compatibility but deprecate
/** @deprecated Use SimulateRequest instead */
export const SimulateInputSchema = SimulateRequestSchema;
/** @deprecated Use SimulateRequest instead */
export type SimulateInput = SimulateRequest;
