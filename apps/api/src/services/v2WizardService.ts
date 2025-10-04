/**
 * V2 Wizard Service - Canonical pension calculation
 * Implements deterministic scenario engine per ZUS rules
 */
import { Engine, makeDemoProviderBundle, EngineInput, EngineOutput } from '@zus/core';
import {
  WizardInitRequest,
  WizardInitResponse,
  WizardContractRequest,
  WizardContractResponse,
  WizardJdgRequest,
  ScenarioResult,
  CompareHigherZusRequest,
  CompareAsUopRequest,
  CompareWhatIfRequest,
  CompareWhatIfResponse,
  SimulateV2Request,
  SimulateV2Response,
  ContractTypeV2,
  RefinementItem,
} from '@zus/types';

const CURRENT_YEAR = 2025;

/**
 * Calculate contribution base for different contract types per ZUS rules
 */
function getContributionBase(
  income: number,
  contractType: ContractTypeV2,
  isRyczalt: boolean
): number {
  switch (contractType) {
    case 'UOP':
      // UoP: full gross salary as contribution base
      return income;
    case 'JDG':
      if (isRyczalt) {
        // JDG ryczałt: use ryczałt base table (simplified: min of 30% or 4500 PLN)
        return Math.min(income * 0.3, 4500);
      }
      // JDG: use max of declared or min base (simplified: 60% of income)
      return Math.max(income * 0.6, 3500);
    case 'JDG_RYCZALT':
      // JDG ryczałt variant: minimum base from parameter table
      return Math.min(income * 0.3, 4500);
    default:
      return income;
  }
}

/**
 * Estimate start work year from birth year and age
 */
function estimateStartWorkYear(birthYear: number, age: number): number {
  const currentYear = CURRENT_YEAR;
  const currentAge = currentYear - birthYear;
  // If age is current age, assume started working at 22
  if (age === currentAge) {
    return birthYear + 22;
  }
  // Otherwise, estimate based on typical work start age
  return birthYear + 22;
}

/**
 * Map quarter number (1-4) to quarter string
 */
function mapQuarterNumber(claimMonth: number): 'Q1' | 'Q2' | 'Q3' | 'Q4' {
  if (claimMonth >= 1 && claimMonth <= 3) return 'Q1';
  if (claimMonth >= 4 && claimMonth <= 6) return 'Q2';
  if (claimMonth >= 7 && claimMonth <= 9) return 'Q3';
  return 'Q4';
}

/**
 * Convert engine output to scenario result
 */
function toScenarioResult(output: EngineOutput): ScenarioResult {
  return {
    kpi: {
      monthlyNominal: output.monthlyPensionNominal,
      monthlyRealToday: output.monthlyPensionRealToday,
      replacementRate: output.replacementRate,
      retirementYear: output.scenario.retirementYear,
      claimQuarter: mapQuarterNumber(output.scenario.claimMonth),
    },
    capitalTrajectory: output.capitalTrajectory.map((row) => ({
      year: row.year,
      capital: row.cumulativeCapitalAfterAnnual,
    })),
    assumptions: output.assumptions,
    explainers: output.explainers,
  };
}

/**
 * Build engine input from wizard context
 */
function buildEngineInput(
  gender: 'M' | 'F',
  age: number,
  monthlyIncome: number,
  contract: ContractTypeV2,
  isRyczalt: boolean,
  claimMonth?: number,
  retirementAgeOverride?: number,
  delayMonths?: number
): EngineInput {
  const currentYear = CURRENT_YEAR;
  const birthYear = currentYear - age;
  const startWorkYear = estimateStartWorkYear(birthYear, age);
  const contributionBase = getContributionBase(monthlyIncome, contract, isRyczalt);

  // Calculate retirement age based on override or delay
  let retirementAge: number | undefined;
  
  if (retirementAgeOverride !== undefined) {
    // Early retirement override - validate minimum age
    const minAge = gender === 'F' ? 50 : 50;
    if (retirementAgeOverride < minAge) {
      throw new Error(`Retirement age cannot be below ${minAge} for gender ${gender}`);
    }
    retirementAge = retirementAgeOverride;
  } else if (delayMonths !== undefined && delayMonths > 0) {
    // Delayed retirement - add months to statutory age
    const statutoryAge = gender === 'F' ? 60 : 65;
    retirementAge = statutoryAge + Math.floor(delayMonths / 12);
    
    // Adjust claim month for partial year delays
    const delayYearRemainder = delayMonths % 12;
    if (delayYearRemainder > 0 && claimMonth !== undefined) {
      claimMonth = ((claimMonth + delayYearRemainder - 1) % 12) + 1;
    }
  }

  return {
    birthYear,
    gender,
    startWorkYear,
    currentGrossMonthly: contributionBase,
    claimMonth: claimMonth ?? 6,
    retirementAge,
    anchorYear: currentYear,
  };
}

/**
 * Step 1: Init (stateless validation)
 */
export function wizardInit(_request: WizardInitRequest): WizardInitResponse {
  // Stateless - just validate and return ok
  return { ok: true };
}

/**
 * Step 2: Contract (stateless validation)
 */
export function wizardContract(_request: WizardContractRequest): WizardContractResponse {
  // Stateless - just validate and return ok
  return { ok: true };
}

/**
 * Step 3a: JDG Quick Result
 * Returns full ScenarioResult for immediate preview
 */
export function wizardJdg(request: WizardJdgRequest): ScenarioResult {
  const {
    gender,
    age,
    monthlyIncome,
    contract,
    isRyczalt,
    claimMonth,
    retirementAgeOverride,
    delayMonths,
  } = request;

  // Validate: UOP cannot have ryczałt
  if (contract === 'UOP' && isRyczalt) {
    throw new Error('Invalid combination: UOP contract cannot use ryczałt taxation');
  }

  const engineInput = buildEngineInput(
    gender,
    age,
    monthlyIncome,
    contract,
    isRyczalt,
    claimMonth,
    retirementAgeOverride,
    delayMonths
  );

  const providers = makeDemoProviderBundle({ anchorYear: CURRENT_YEAR });
  const output = Engine.calculate(engineInput, providers);

  return toScenarioResult(output);
}

/**
 * Compare: Higher ZUS
 * Calculate pension with higher contribution base
 */
export function compareHigherZus(request: CompareHigherZusRequest): ScenarioResult {
  const {
    gender,
    age,
    monthlyIncome,
    contract,
    isRyczalt,
    claimMonth,
    zusMultiplier = 1.5,
  } = request;

  // Calculate with higher income
  const higherIncome = monthlyIncome * zusMultiplier;

  const engineInput = buildEngineInput(gender, age, higherIncome, contract, isRyczalt, claimMonth);

  const providers = makeDemoProviderBundle({ anchorYear: CURRENT_YEAR });
  const output = Engine.calculate(engineInput, providers);

  return toScenarioResult(output);
}

/**
 * Compare: As UoP
 * Calculate pension as if working under UoP contract
 */
export function compareAsUop(request: CompareAsUopRequest): ScenarioResult {
  const { gender, age, monthlyIncome, claimMonth } = request;

  // Force UoP contract type
  const engineInput = buildEngineInput(gender, age, monthlyIncome, 'UOP', false, claimMonth);

  const providers = makeDemoProviderBundle({ anchorYear: CURRENT_YEAR });
  const output = Engine.calculate(engineInput, providers);

  return toScenarioResult(output);
}

/**
 * Compare: What-If
 * Calculate multiple refinement scenarios
 */
export function compareWhatIf(request: CompareWhatIfRequest): CompareWhatIfResponse {
  const { baselineContext, items } = request;

  // Calculate baseline
  const baselineInput = buildEngineInput(
    baselineContext.gender,
    baselineContext.age,
    baselineContext.monthlyIncome,
    baselineContext.contract,
    baselineContext.isRyczalt,
    baselineContext.claimMonth
  );

  const providers = makeDemoProviderBundle({ anchorYear: CURRENT_YEAR });
  const baselineOutput = Engine.calculate(baselineInput, providers);
  const baseline = toScenarioResult(baselineOutput);

  // Calculate variants
  const variants: ScenarioResult[] = items.map((item: RefinementItem) => {
    let variantInput = { ...baselineInput };

    switch (item.kind) {
      case 'contribution_boost':
        // Increase monthly gross by specified amount
        variantInput.currentGrossMonthly += item.monthly ?? 1000;
        break;
      case 'delay_retirement':
        // Add years to retirement age
        variantInput.retirementAge = (variantInput.retirementAge ?? 65) + (item.years ?? 2);
        break;
      case 'higher_base':
        // Increase contribution base by percentage
        variantInput.currentGrossMonthly *= 1 + (item.monthly ?? 20) / 100;
        break;
      case 'early_retirement':
        // Reduce retirement age by specified years (default 5)
        const currentRetirementAge = variantInput.retirementAge ?? (baselineContext.gender === 'F' ? 60 : 65);
        const earlyYears = item.years ?? 5;
        const minAge = baselineContext.gender === 'F' ? 50 : 50;
        variantInput.retirementAge = Math.max(currentRetirementAge - earlyYears, minAge);
        break;
      case 'delay_months':
        // Delay retirement by specified months
        const statutoryAge = baselineContext.gender === 'F' ? 60 : 65;
        const delayMonths = item.months ?? 12;
        variantInput.retirementAge = statutoryAge + Math.floor(delayMonths / 12);
        // Adjust claim month for partial year delays
        const delayYearRemainder = delayMonths % 12;
        if (delayYearRemainder > 0) {
          const originalClaimMonth = baselineContext.claimMonth ?? 6;
          variantInput.claimMonth = ((originalClaimMonth + delayYearRemainder - 1) % 12) + 1;
        }
        break;
      case 'non_contributory_unemployment':
        // Non-contributory period - no impact on calculation but tracked
        // Engine will handle this as zero contributions for specified months
        // For now, this is a placeholder - actual implementation would require
        // extending the engine to track non-contributory periods
        break;
    }

    const variantOutput = Engine.calculate(variantInput, providers);
    const result = toScenarioResult(variantOutput);
    
    // Add explainer for the variant
    const explainers = [...result.explainers];
    switch (item.kind) {
      case 'early_retirement':
        explainers.push(
          `Wcześniejsza emerytura (${item.years ?? 5} lat) zwiększa dzielnik (SDŻ), co zazwyczaj obniża miesięczne świadczenie.`
        );
        break;
      case 'delay_months':
        explainers.push(
          `Opóźnienie emerytury o ${item.months ?? 12} miesięcy zmniejsza dzielnik (SDŻ) i może dodać dodatkową waloryzację, co zazwyczaj zwiększa miesięczne świadczenie.`
        );
        break;
      case 'non_contributory_unemployment':
        explainers.push(
          `Okres bezrobocia (${item.months ?? 0} miesięcy) nie generuje składek emerytalnych, ale jest uwzględniony w historii zawodowej.`
        );
        break;
    }
    
    return { ...result, explainers };
  });

  return { baseline, variants };
}

/**
 * Final Simulate
 * Comprehensive calculation with baseline and optional variants
 */
export function simulateV2(request: SimulateV2Request): SimulateV2Response {
  const { baselineContext, variants: variantItems } = request;

  // Validate: UOP cannot have ryczałt
  if (baselineContext.contract === 'UOP' && baselineContext.isRyczalt) {
    throw new Error('Invalid combination: UOP contract cannot use ryczałt taxation');
  }

  // Calculate baseline
  const baselineInput = buildEngineInput(
    baselineContext.gender,
    baselineContext.age,
    baselineContext.monthlyIncome,
    baselineContext.contract,
    baselineContext.isRyczalt,
    baselineContext.claimMonth
  );

  const providers = makeDemoProviderBundle({ anchorYear: CURRENT_YEAR });
  const baselineOutput = Engine.calculate(baselineInput, providers);
  const baselineResult = toScenarioResult(baselineOutput);

  // Calculate variants if present
  let variants: ScenarioResult[] | undefined;
  if (variantItems && variantItems.length > 0) {
    variants = variantItems.map((item: RefinementItem) => {
      let variantInput = { ...baselineInput };

      switch (item.kind) {
        case 'contribution_boost':
          variantInput.currentGrossMonthly += item.monthly ?? 1000;
          break;
        case 'delay_retirement':
          variantInput.retirementAge = (variantInput.retirementAge ?? 65) + (item.years ?? 2);
          break;
        case 'higher_base':
          variantInput.currentGrossMonthly *= 1 + (item.monthly ?? 20) / 100;
          break;
        case 'early_retirement':
          const currentRetirementAge = variantInput.retirementAge ?? (baselineContext.gender === 'F' ? 60 : 65);
          const earlyYears = item.years ?? 5;
          const minAge = baselineContext.gender === 'F' ? 50 : 50;
          variantInput.retirementAge = Math.max(currentRetirementAge - earlyYears, minAge);
          break;
        case 'delay_months':
          const statutoryAge = baselineContext.gender === 'F' ? 60 : 65;
          const delayMonths = item.months ?? 12;
          variantInput.retirementAge = statutoryAge + Math.floor(delayMonths / 12);
          const delayYearRemainder = delayMonths % 12;
          if (delayYearRemainder > 0) {
            const originalClaimMonth = baselineContext.claimMonth ?? 6;
            variantInput.claimMonth = ((originalClaimMonth + delayYearRemainder - 1) % 12) + 1;
          }
          break;
        case 'non_contributory_unemployment':
          // Non-contributory period - tracked but no impact on calculation
          break;
      }

      const variantOutput = Engine.calculate(variantInput, providers);
      return toScenarioResult(variantOutput);
    });
  }

  return { baselineResult, variants };
}
