/**
 * Scenario Service - Business logic for scenario engine v2
 * Handles JDG quick calc, career composition, and comparisons
 */
import { Engine, makeDemoProviderBundle, EngineInput } from '@zus/core';
import {
  JdgQuickRequest,
  JdgQuickResult,
  ComposeCareerRequest,
  ComposeCareerResult,
  ComparisonRequest,
  ComparisonResult,
  ContractType,
} from '@zus/types';

const CURRENT_YEAR = 2025;

/**
 * Calculate contribution base for different contract types
 */
function getContributionBase(income: number, contractType: ContractType): number {
  switch (contractType) {
    case 'uop':
      // UoP: full salary as base
      return income;
    case 'jdg':
      // JDG: 60% of income as typical base
      return income * 0.6;
    case 'jdg_ryczalt':
      // JDG ryczałt: minimum base (assuming ~4500 PLN in 2025)
      return Math.min(income * 0.3, 4500);
    default:
      return income;
  }
}

/**
 * Estimate start work year from age and birth year
 */
function estimateStartWorkYear(birthYear: number, age: number): number {
  const currentYear = CURRENT_YEAR;
  const assumedStartAge = 22; // Average higher education completion
  return Math.max(birthYear + assumedStartAge, currentYear - age + assumedStartAge);
}

/**
 * JDG Quick Calculation
 * Fast preview for wizard step 3→4
 */
export function calculateJdgQuick(request: JdgQuickRequest): JdgQuickResult {
  const { birthYear, gender, age, monthlyIncome, isRyczalt } = request;

  const startWorkYear = estimateStartWorkYear(birthYear, age);
  const contributionBase = getContributionBase(
    monthlyIncome,
    isRyczalt ? 'jdg_ryczalt' : 'jdg'
  );

  // Build engine input
  const engineInput: EngineInput = {
    birthYear,
    gender,
    startWorkYear,
    currentGrossMonthly: contributionBase,
    anchorYear: CURRENT_YEAR,
  };

  const providers = makeDemoProviderBundle({ anchorYear: CURRENT_YEAR });
  const output = Engine.calculate(engineInput, providers);

  // Map to JDG quick result format
  return {
    scenario: {
      retirementAge: output.scenario.retirementAge,
      retirementYear: output.scenario.retirementYear,
      retirementQuarter: Math.floor((output.scenario.claimMonth - 1) / 3) + 1,
      gender: output.scenario.gender,
    },
    nominalPension: output.monthlyPensionNominal,
    realPension: output.monthlyPensionRealToday,
    replacementRate: output.replacementRate,
    capitalTrajectory: output.capitalTrajectory.map((row) => ({
      year: row.year,
      capital: row.cumulativeCapitalAfterAnnual,
    })),
    assumptions: {
      startWorkYear,
      contributionBase,
      contributionRate: 0.1952,
    },
  };
}

/**
 * Compose Career - Multi-period simulation
 * Weighted average approach for multiple contract types
 */
export function composeCareer(request: ComposeCareerRequest): ComposeCareerResult {
  const { birthYear, gender, careerPeriods, retirementAge, claimMonth } = request;

  // Calculate weighted average income
  const totalYears = careerPeriods.reduce((sum, p) => sum + p.yearsOfWork, 0);
  const weightedIncome = careerPeriods.reduce((sum, period) => {
    const base = getContributionBase(period.monthlyIncome, period.contractType);
    return sum + base * period.yearsOfWork;
  }, 0);
  const avgContributionBase = weightedIncome / totalYears;

  // Estimate start year from first period
  const currentAge = CURRENT_YEAR - birthYear;
  const startWorkYear = estimateStartWorkYear(birthYear, currentAge) - totalYears + currentAge;

  // Build engine input
  const engineInput: EngineInput = {
    birthYear,
    gender,
    startWorkYear: Math.max(startWorkYear, birthYear + 18),
    currentGrossMonthly: avgContributionBase,
    retirementAge,
    claimMonth: claimMonth || 6,
    anchorYear: CURRENT_YEAR,
  };

  const providers = makeDemoProviderBundle({ anchorYear: CURRENT_YEAR });
  const output = Engine.calculate(engineInput, providers);

  // Build period breakdown
  const periodBreakdown = careerPeriods.map((period) => {
    const base = getContributionBase(period.monthlyIncome, period.contractType);
    const annualContribution = base * 12 * 0.1952;
    return {
      contractType: period.contractType,
      years: period.yearsOfWork,
      avgIncome: period.monthlyIncome,
      totalContributions: annualContribution * period.yearsOfWork,
    };
  });

  return {
    scenario: {
      retirementAge: output.scenario.retirementAge,
      retirementYear: output.scenario.retirementYear,
      claimMonth: output.scenario.claimMonth,
      gender: output.scenario.gender,
      totalWorkYears: totalYears,
    },
    monthlyPensionNominal: output.monthlyPensionNominal,
    monthlyPensionRealToday: output.monthlyPensionRealToday,
    replacementRate: output.replacementRate,
    capitalTrajectory: output.capitalTrajectory.map((row) => ({
      year: row.year,
      annualWage: row.annualWage,
      annualContribution: row.annualContribution,
      cumulativeCapital: row.cumulativeCapitalAfterAnnual,
    })),
    periodBreakdown,
    finalization: {
      quarterUsed: output.finalization.quarterUsed,
      finalCapital: output.finalization.compoundedResult,
    },
  };
}

/**
 * Compare Scenarios
 * Generate comparison between base and alternative scenarios
 */
export function compareScenarios(request: ComparisonRequest): ComparisonResult {
  const { baseScenario, comparisonType, comparisonParams } = request;

  // Calculate base scenario
  let baseResult: JdgQuickResult | ComposeCareerResult;
  let baseLabel = '';

  if ('careerPeriods' in baseScenario) {
    baseResult = composeCareer(baseScenario);
    baseLabel = 'Twój scenariusz';
  } else {
    baseResult = calculateJdgQuick(baseScenario);
    baseLabel = baseScenario.isRyczalt ? 'JDG (ryczałt)' : 'JDG';
  }

  // Build comparison scenario based on type
  let comparisonResult: JdgQuickResult | ComposeCareerResult;
  let comparisonLabel = '';
  let recommendation = '';

  switch (comparisonType) {
    case 'uop_vs_jdg': {
      if ('monthlyIncome' in baseScenario) {
        // Convert JDG to UoP
        const uopRequest: JdgQuickRequest = {
          ...baseScenario,
          monthlyIncome: baseScenario.monthlyIncome,
          isRyczalt: false,
        };
        comparisonResult = calculateJdgQuick({
          ...uopRequest,
          monthlyIncome: baseScenario.monthlyIncome, // Use full income for UoP
        });
        comparisonLabel = 'Umowa o pracę (UoP)';
        
        recommendation = 'Umowa o pracę może dać wyższą emeryturę dzięki pełnej podstawie składkowej';
      } else {
        throw new Error('UoP vs JDG comparison requires JDG base scenario');
      }
      break;
    }

    case 'higher_zus': {
      const multiplier = comparisonParams?.zusMultiplier || 1.5;
      if ('monthlyIncome' in baseScenario) {
        comparisonResult = calculateJdgQuick({
          ...baseScenario,
          monthlyIncome: baseScenario.monthlyIncome * multiplier,
          isRyczalt: false, // Higher base implies not ryczałt
        });
        comparisonLabel = `${Math.round((multiplier - 1) * 100)}% wyższy ZUS`;
        recommendation = `Płacenie o ${Math.round((multiplier - 1) * 100)}% więcej ZUS zwiększa emeryturę o ~${Math.round(
          ((('nominalPension' in comparisonResult ? comparisonResult.nominalPension : 0) -
            ('nominalPension' in baseResult ? baseResult.nominalPension : 0)) /
            ('nominalPension' in baseResult ? baseResult.nominalPension : 1)) *
            100
        )}%`;
      } else {
        throw new Error('Higher ZUS comparison requires simple scenario');
      }
      break;
    }

    case 'delayed_retirement': {
      const delayYears = comparisonParams?.delayYears || 2;
      if ('careerPeriods' in baseScenario) {
        comparisonResult = composeCareer({
          ...baseScenario,
          retirementAge: (baseScenario.retirementAge || 67) + delayYears,
        });
        comparisonLabel = `Przejście +${delayYears} lata`;
        recommendation = `Opóźnienie emerytury o ${delayYears} lata zwiększa emeryturę dzięki dłuższemu gromadzeniu kapitału`;
      } else {
        throw new Error('Delayed retirement comparison requires compose scenario');
      }
      break;
    }

    default:
      throw new Error(`Unknown comparison type: ${comparisonType}`);
  }

  const basePension = 'nominalPension' in baseResult ? baseResult.nominalPension : baseResult.monthlyPensionNominal;
  const basePensionReal = 'realPension' in baseResult ? baseResult.realPension : baseResult.monthlyPensionRealToday;
  const comparisonPension = 'nominalPension' in comparisonResult ? comparisonResult.nominalPension : comparisonResult.monthlyPensionNominal;
  const comparisonPensionReal = 'realPension' in comparisonResult ? comparisonResult.realPension : comparisonResult.monthlyPensionRealToday;

  return {
    base: {
      label: baseLabel,
      pension: basePension,
      pensionReal: basePensionReal,
      replacementRate: baseResult.replacementRate,
    },
    comparison: {
      label: comparisonLabel,
      pension: comparisonPension,
      pensionReal: comparisonPensionReal,
      replacementRate: comparisonResult.replacementRate,
    },
    difference: {
      absolute: comparisonPension - basePension,
      percentage: ((comparisonPension - basePension) / basePension) * 100,
    },
    recommendation,
  };
}
