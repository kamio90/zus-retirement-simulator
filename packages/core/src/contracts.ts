/**
 * Public engine contracts and interfaces
 * Core type definitions for the pension calculation engine
 * All interfaces represent pure data structures with no logic
 */

// Core domain types
type Gender = 'M' | 'F';
type Year = number;
type Month = number;
type CurrencyPLN = number;
type Percent = number;

/**
 * Trajectory row representing one year of capital accumulation
 */
export interface TrajectoryRowVO {
  year: number;
  annualWage: number;
  annualContribution: number;
  annualValorizationIndex: number;
  cumulativeCapitalAfterAnnual: number;
}

/**
 * Finalization step representing quarterly valorization
 */
export interface FinalizationVO {
  quarterIndexId: string;
  compoundedResult: number;
  quarterUsed: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  indicesApplied: string[];
}

/**
 * Assumptions used in the calculation for transparency
 */
export interface AssumptionsVO {
  annualIndexSetId: string;
  quarterlyIndexSetId: string;
  lifeTableId: string;
  cpiVintageId: string;
  wageVintageId: string;
  contribRuleId: string;
  providerKind: string;
}

export interface EngineInput {
  birthYear: Year;
  gender: Gender;
  startWorkYear: Year;
  currentGrossMonthly: CurrencyPLN;
  retirementAge?: number;
  accumulatedInitialCapital?: CurrencyPLN;
  subAccountBalance?: CurrencyPLN;
  absenceFactor?: Percent;
  claimMonth?: Month;
  anchorYear?: Year;
}

export interface EngineOutput {
  scenario: {
    retirementAge: number;
    retirementYear: Year;
    claimMonth: Month;
    gender: Gender;
  };
  monthlyPensionNominal: CurrencyPLN;
  monthlyPensionRealToday: CurrencyPLN;
  replacementRate: number;
  capitalTrajectory: TrajectoryRowVO[];
  finalization: FinalizationVO;
  life: {
    years: number;
    lifeTableId: string;
  };
  assumptions: AssumptionsVO;
  explainers: string[];
}

/**
 * Engine interface - pure calculation orchestration
 */
export interface Engine {
  calculate(input: EngineInput, providers: import('./providers').ProviderBundle): EngineOutput;
}
