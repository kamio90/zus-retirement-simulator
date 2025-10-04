/**
 * buildOutput
 * Shapes EngineOutput, builds trajectory, assumptions, explainers
 * - Trajectory rows, finalization, provider IDs, explainers
 *
 * SPEC_ENGINE.md: Section I
 * pipeline.md: Step 12
 */
import { EngineOutput } from '../contracts';
import { AnnualValorizedState } from './annual-valorization';
import { FinalizationStep } from './quarterly-valorization';
import { BaseComposition } from './compose-base';
import { LifeExpectancySelection } from './life-expectancy';
import { PensionCalcsResult } from './pension-calcs';

export interface BuildOutputParams {
  scenario: {
    retirementAge: number;
    retirementYear: number;
    claimMonth: number;
    gender: 'M' | 'F';
  };
  annualTrajectory: AnnualValorizedState[];
  finalization: FinalizationStep;
  base: BaseComposition;
  life: LifeExpectancySelection;
  pension: PensionCalcsResult;
  assumptions: Record<string, string>;
  explainers: string[];
}

export function buildOutput(params: BuildOutputParams): EngineOutput {
  return {
    scenario: params.scenario,
    monthlyPensionNominal: params.pension.monthlyPensionNominal,
    monthlyPensionRealToday: params.pension.monthlyPensionRealToday,
    replacementRate: params.pension.replacementRate,
    capitalTrajectory: params.annualTrajectory,
    finalization: params.finalization,
    assumptions: params.assumptions,
    explainers: params.explainers,
  };
}
