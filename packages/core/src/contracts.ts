// Public engine interfaces (no logic)
// -----------------------------------
import { Gender, Year, Month, CurrencyPLN, Percent, TerytCode, TrajectoryRowVO, FinalizationVO, AssumptionsVO } from '@types/domain';

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
  calculate(input: EngineInput, providers: ProviderBundle): EngineOutput;
}
