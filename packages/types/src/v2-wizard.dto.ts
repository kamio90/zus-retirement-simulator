/**
 * V2 Wizard API DTOs
 * Step-by-step wizard flow with deterministic scenario results
 */
import { z } from 'zod';

// ============================================================================
// Common Types
// ============================================================================

export type GenderType = 'M' | 'F';
export type ContractTypeV2 = 'UOP' | 'JDG' | 'JDG_RYCZALT';
export type QuarterType = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export const GenderSchema = z.enum(['M', 'F']);
export const ContractV2Schema = z.enum(['UOP', 'JDG', 'JDG_RYCZALT']);
export const QuarterSchema = z.enum(['Q1', 'Q2', 'Q3', 'Q4']);

// ============================================================================
// Scenario Result (unified response shape)
// ============================================================================

export interface ScenarioKPI {
  monthlyNominal: number;
  monthlyRealToday: number;
  replacementRate: number;
  retirementYear: number;
  claimQuarter: QuarterType;
}

export interface CapitalTrajectoryPoint {
  year: number;
  capital: number;
}

export interface AssumptionsMetadata {
  providerKind: string;
  annualIndexSetId: string;
  quarterlyIndexSetId: string;
  lifeTableId: string;
  wageVintageId: string;
  cpiVintageId: string;
  contribRuleId: string;
}

export interface ScenarioResult {
  kpi: ScenarioKPI;
  capitalTrajectory: CapitalTrajectoryPoint[];
  assumptions: AssumptionsMetadata;
  explainers: string[];
}

export const ScenarioResultSchema: z.ZodType<ScenarioResult> = z.object({
  kpi: z.object({
    monthlyNominal: z.number(),
    monthlyRealToday: z.number(),
    replacementRate: z.number(),
    retirementYear: z.number(),
    claimQuarter: QuarterSchema,
  }),
  capitalTrajectory: z.array(
    z.object({
      year: z.number(),
      capital: z.number(),
    })
  ),
  assumptions: z.object({
    providerKind: z.string(),
    annualIndexSetId: z.string(),
    quarterlyIndexSetId: z.string(),
    lifeTableId: z.string(),
    wageVintageId: z.string(),
    cpiVintageId: z.string(),
    contribRuleId: z.string(),
  }),
  explainers: z.array(z.string()),
});

// ============================================================================
// Step 1: Init (Gender & Age) - stateless
// ============================================================================

export interface WizardInitRequest {
  gender: GenderType;
  age: number;
}

export const WizardInitRequestSchema = z.object({
  gender: GenderSchema,
  age: z.number().int().min(18).max(100),
});

export interface WizardInitResponse {
  ok: true;
}

// ============================================================================
// Step 2: Contract Type - stateless
// ============================================================================

export interface WizardContractRequest {
  contract: ContractTypeV2;
}

export const WizardContractRequestSchema = z.object({
  contract: ContractV2Schema,
});

export interface WizardContractResponse {
  ok: true;
}

// ============================================================================
// Step 3a: JDG Quick Result
// ============================================================================

export interface WizardJdgRequest {
  gender: GenderType;
  age: number;
  contract: ContractTypeV2;
  monthlyIncome: number;
  isRyczalt: boolean;
  claimMonth?: number;
  retirementAgeOverride?: number; // For early retirement what-if
  delayMonths?: number; // For delayed retirement (0, 12, 24)
}

export const WizardJdgRequestSchema = z.object({
  gender: GenderSchema,
  age: z.number().int().min(18).max(100),
  contract: ContractV2Schema,
  monthlyIncome: z.number().min(0).max(1000000),
  isRyczalt: z.boolean(),
  claimMonth: z.number().int().min(1).max(12).optional(),
  retirementAgeOverride: z.number().int().min(50).max(80).optional(),
  delayMonths: z.enum([0, 12, 24]).optional(),
});

export type WizardJdgResponse = ScenarioResult;

// ============================================================================
// Refinement Items for "What-If" scenarios
// ============================================================================

export interface RefinementItem {
  kind:
    | 'contribution_boost'
    | 'delay_retirement'
    | 'higher_base'
    | 'early_retirement'
    | 'delay_months'
    | 'non_contributory_unemployment';
  years?: number;
  monthly?: number;
  months?: number;
  label?: string;
}

export const RefinementItemSchema = z.object({
  kind: z.enum([
    'contribution_boost',
    'delay_retirement',
    'higher_base',
    'early_retirement',
    'delay_months',
    'non_contributory_unemployment',
  ]),
  years: z.number().int().min(1).max(10).optional(),
  monthly: z.number().min(0).max(1000000).optional(),
  months: z.number().int().min(0).max(600).optional(), // For delay_months and unemployment periods
  label: z.string().optional(),
});

// ============================================================================
// Compare Endpoints
// ============================================================================

// Higher ZUS comparison
export interface CompareHigherZusRequest {
  gender: GenderType;
  age: number;
  contract: ContractTypeV2;
  monthlyIncome: number;
  isRyczalt: boolean;
  claimMonth?: number;
  zusMultiplier?: number; // default 1.5 (50% higher)
}

export const CompareHigherZusRequestSchema = z.object({
  gender: GenderSchema,
  age: z.number().int().min(18).max(100),
  contract: ContractV2Schema,
  monthlyIncome: z.number().min(0).max(1000000),
  isRyczalt: z.boolean(),
  claimMonth: z.number().int().min(1).max(12).optional(),
  zusMultiplier: z.number().min(1).max(3).optional(),
});

// As UoP comparison
export interface CompareAsUopRequest {
  gender: GenderType;
  age: number;
  contract: ContractTypeV2;
  monthlyIncome: number;
  isRyczalt: boolean;
  claimMonth?: number;
}

export const CompareAsUopRequestSchema = z.object({
  gender: GenderSchema,
  age: z.number().int().min(18).max(100),
  contract: ContractV2Schema,
  monthlyIncome: z.number().min(0).max(1000000),
  isRyczalt: z.boolean(),
  claimMonth: z.number().int().min(1).max(12).optional(),
});

// What-if comparison
export interface CompareWhatIfRequest {
  baselineContext: WizardJdgRequest;
  items: RefinementItem[];
}

export const CompareWhatIfRequestSchema = z.object({
  baselineContext: WizardJdgRequestSchema,
  items: z.array(RefinementItemSchema).min(1).max(5),
});

export interface CompareWhatIfResponse {
  baseline: ScenarioResult;
  variants: ScenarioResult[];
}

// ============================================================================
// Final Simulate Endpoint
// ============================================================================

export interface SimulateV2Request {
  baselineContext: WizardJdgRequest;
  variants?: RefinementItem[];
}

export const SimulateV2RequestSchema = z.object({
  baselineContext: WizardJdgRequestSchema,
  variants: z.array(RefinementItemSchema).max(10).optional(),
});

export interface SimulateV2Response {
  baselineResult: ScenarioResult;
  variants?: ScenarioResult[];
}
