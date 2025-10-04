/**
 * Simulation service
 * Orchestrates pension calculation using the core engine
 */
import { SimulateRequest, SimulationResult } from '@zus/types';
import { buildEngineWithDemoProviders, EngineInput, EngineOutput } from '@zus/core';
import { logger } from '../utils/logger';

// Build engine with demo providers (in production, use official providers)
const engine = buildEngineWithDemoProviders({ anchorYear: 2025 });

/**
 * Maps SimulateRequest to EngineInput
 */
function mapRequestToEngineInput(request: SimulateRequest): EngineInput {
  return {
    birthYear: request.birthYear,
    gender: request.gender,
    startWorkYear: request.startWorkYear,
    currentGrossMonthly: request.currentGrossMonthly,
    retirementAge: request.retirementAge,
    accumulatedInitialCapital: request.accumulatedInitialCapital,
    subAccountBalance: request.subAccountBalance,
    absenceFactor: request.absenceFactor,
    claimMonth: request.claimMonth,
    anchorYear: 2025,
  };
}

/**
 * Maps EngineOutput to SimulationResult
 */
function mapEngineOutputToResult(output: EngineOutput): SimulationResult {
  return {
    scenario: {
      retirementAge: output.scenario.retirementAge,
      retirementYear: output.scenario.retirementYear,
      claimMonth: output.scenario.claimMonth,
      gender: output.scenario.gender,
    },
    monthlyPensionNominal: output.monthlyPensionNominal,
    monthlyPensionRealToday: output.monthlyPensionRealToday,
    replacementRate: output.replacementRate,
    capitalTrajectory: output.capitalTrajectory.map(
      (row: EngineOutput['capitalTrajectory'][0]) => ({
        year: row.year,
        annualWage: row.annualWage,
        annualContribution: row.annualContribution,
        annualValorizationIndex: row.annualValorizationIndex,
        cumulativeCapitalAfterAnnual: row.cumulativeCapitalAfterAnnual,
      })
    ),
    finalization: {
      quarterIndexId: output.finalization.quarterIndexId,
      compoundedResult: output.finalization.compoundedResult,
    },
    assumptions: {
      annualValorizationSetId: output.assumptions.annualIndexSetId,
      quarterlySetId: output.assumptions.quarterlyIndexSetId,
      sdżTableId: output.assumptions.lifeTableId,
      cpiVintage: output.assumptions.cpiVintageId,
      wageVintage: output.assumptions.wageVintageId,
      providerKind: output.assumptions.providerKind as 'DeterministicDemo' | 'OfficialTables',
    },
    explainers: output.explainers,
  };
}

export const simulateService = {
  /**
   * Simulate pension calculation
   * @param request Validated SimulateRequest
   * @returns SimulationResult
   */
  simulate: (request: SimulateRequest): SimulationResult => {
    logger.info(
      `Simulating pension for birthYear=${request.birthYear}, gender=${request.gender}, startWorkYear=${request.startWorkYear}`
    );

    // Map request to engine input
    const engineInput = mapRequestToEngineInput(request);

    // Execute calculation
    const engineOutput = engine(engineInput);

    // Map output to result
    const result = mapEngineOutputToResult(engineOutput);

    logger.info(
      `Simulation complete: monthlyPensionNominal=${result.monthlyPensionNominal.toFixed(2)} PLN`
    );

    return result;
  },
};
