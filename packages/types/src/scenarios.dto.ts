/**
 * Scenario Engine v2 DTOs
 * Step-by-step calculation requests and comparison scenarios
 */
import { z } from 'zod';

// ============================================================================
// Contract Types & Career Periods
// ============================================================================

export type ContractType = 'uop' | 'jdg' | 'jdg_ryczalt' | 'no_contribution';

export const ContractTypeSchema = z.enum(['uop', 'jdg', 'jdg_ryczalt', 'no_contribution']);

export interface CareerPeriod {
  contractType: ContractType;
  yearsOfWork: number;
  monthlyIncome: number;
  // Optional: startYear for precise ordering
  startYear?: number;
}

export const CareerPeriodSchema = z.object({
  contractType: ContractTypeSchema,
  yearsOfWork: z.number().int().min(1).max(50),
  monthlyIncome: z.number().min(0).max(1000000),
  startYear: z.number().int().min(1950).max(2100).optional(),
});

// ============================================================================
// Step 1: JDG Quick Calculation (Step 3→4 in wizard)
// ============================================================================

export interface JdgQuickRequest {
  birthYear: number;
  gender: 'M' | 'F';
  age: number;
  monthlyIncome: number;
  isRyczalt: boolean;
}

export const JdgQuickRequestSchema = z.object({
  birthYear: z.number().int().min(1940).max(2010),
  gender: z.enum(['M', 'F']),
  age: z.number().int().min(18).max(100),
  monthlyIncome: z.number().min(0).max(1000000),
  isRyczalt: z.boolean(),
});

export interface JdgQuickResult {
  scenario: {
    retirementAge: number;
    retirementYear: number;
    retirementQuarter: number;
    gender: 'M' | 'F';
  };
  nominalPension: number;
  realPension: number;
  replacementRate: number;
  capitalTrajectory: Array<{
    year: number;
    capital: number;
  }>;
  assumptions: {
    startWorkYear: number;
    contributionBase: number;
    contributionRate: number;
  };
}

// ============================================================================
// Step 2: Compose Career (Multi-period simulation)
// ============================================================================

export interface ComposeCareerRequest {
  birthYear: number;
  gender: 'M' | 'F';
  careerPeriods: CareerPeriod[];
  retirementAge?: number;
  claimMonth?: number;
}

export const ComposeCareerRequestSchema = z.object({
  birthYear: z.number().int().min(1940).max(2010),
  gender: z.enum(['M', 'F']),
  careerPeriods: z.array(CareerPeriodSchema).min(1).max(10),
  retirementAge: z.number().int().min(60).max(70).optional(),
  claimMonth: z.number().int().min(1).max(12).optional(),
});

export interface ComposeCareerResult {
  scenario: {
    retirementAge: number;
    retirementYear: number;
    claimMonth: number;
    gender: 'M' | 'F';
    totalWorkYears: number;
  };
  monthlyPensionNominal: number;
  monthlyPensionRealToday: number;
  replacementRate: number;
  capitalTrajectory: Array<{
    year: number;
    annualWage: number;
    annualContribution: number;
    cumulativeCapital: number;
  }>;
  periodBreakdown: Array<{
    contractType: ContractType;
    years: number;
    avgIncome: number;
    totalContributions: number;
  }>;
  finalization: {
    quarterUsed: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    finalCapital: number;
  };
}

// ============================================================================
// Step 3: Scenario Comparisons
// ============================================================================

export type ComparisonType = 'uop_vs_jdg' | 'higher_zus' | 'delayed_retirement';

export const ComparisonTypeSchema = z.enum(['uop_vs_jdg', 'higher_zus', 'delayed_retirement']);

export interface ComparisonRequest {
  baseScenario: JdgQuickRequest | ComposeCareerRequest;
  comparisonType: ComparisonType;
  comparisonParams?: {
    // For higher_zus: multiplier (e.g., 1.5 for 50% higher)
    zusMultiplier?: number;
    // For delayed_retirement: additional years
    delayYears?: number;
  };
}

export const ComparisonRequestSchema = z.object({
  baseScenario: z.union([JdgQuickRequestSchema, ComposeCareerRequestSchema]),
  comparisonType: ComparisonTypeSchema,
  comparisonParams: z
    .object({
      zusMultiplier: z.number().min(1).max(3).optional(),
      delayYears: z.number().int().min(1).max(5).optional(),
    })
    .optional(),
});

export interface ComparisonResult {
  base: {
    label: string;
    pension: number;
    pensionReal: number;
    replacementRate: number;
  };
  comparison: {
    label: string;
    pension: number;
    pensionReal: number;
    replacementRate: number;
  };
  difference: {
    absolute: number;
    percentage: number;
  };
  recommendation: string;
}
