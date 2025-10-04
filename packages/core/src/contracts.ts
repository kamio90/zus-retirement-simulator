// Public engine interfaces (no logic)
// -----------------------------------

// Temporarily using placeholder types until domain types are implemented
type Gender = 'M' | 'F';
type Year = number;
type Month = number;
type CurrencyPLN = number;
type Percent = number;
type TerytCode = string;
type TrajectoryRowVO = any;
type FinalizationVO = any;
type AssumptionsVO = any;

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
  assumptions: AssumptionsVO;
  explainers: string[];
}

export interface Engine {
  calculate(input: EngineInput, providers: any): EngineOutput;
}
