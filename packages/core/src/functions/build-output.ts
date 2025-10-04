/**
 * buildOutput
 * Shapes EngineOutput, builds trajectory, assumptions, explainers
 * - Trajectory rows, finalization, provider IDs, explainers
 *
 * SPEC_ENGINE.md: Section I
 * pipeline.md: Step 12
 */
import { EngineOutput, TrajectoryRowVO, FinalizationVO, AssumptionsVO } from '../contracts';
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
  assumptions: {
    annualIndexSetId: string;
    quarterlyIndexSetId: string;
    lifeTableId: string;
    cpiVintageId: string;
    wageVintageId: string;
    contribRuleId: string;
    providerKind: string;
  };
  explainers: string[];
}

export function buildOutput(params: BuildOutputParams): EngineOutput {
  // Map internal AnnualValorizedState to TrajectoryRowVO
  const capitalTrajectory: TrajectoryRowVO[] = params.annualTrajectory.map((state) => ({
    year: state.year,
    annualWage: 0, // TODO: need to pass wage series through
    annualContribution: state.contributionAdded,
    annualValorizationIndex: parseFloat(state.annualIndexAppliedId.split('.').pop() || '1'),
    cumulativeCapitalAfterAnnual: state.cumulativeCapitalAfterAnnual,
  }));

  // Map internal FinalizationStep to FinalizationVO
  const finalization: FinalizationVO = {
    quarterIndexId: params.finalization.indicesApplied.join(','),
    compoundedResult: params.finalization.resultingCapital,
  };

  // Map assumptions
  const assumptions: AssumptionsVO = {
    annualIndexSetId: params.assumptions.annualIndexSetId,
    quarterlyIndexSetId: params.assumptions.quarterlyIndexSetId,
    lifeTableId: params.assumptions.lifeTableId,
    cpiVintageId: params.assumptions.cpiVintageId,
    wageVintageId: params.assumptions.wageVintageId,
    contribRuleId: params.assumptions.contribRuleId,
    providerKind: params.assumptions.providerKind,
  };

  return {
    scenario: params.scenario,
    monthlyPensionNominal: params.pension.monthlyPensionNominal,
    monthlyPensionRealToday: params.pension.monthlyPensionRealToday,
    replacementRate: params.pension.replacementRate,
    capitalTrajectory,
    finalization,
    assumptions,
    explainers: params.explainers,
  };
}
