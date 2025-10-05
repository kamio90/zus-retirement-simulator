/**
 * Engine.calculate
 * Pure orchestration of pension simulation pipeline.
 * Accepts validated EngineInput and ProviderBundle, returns EngineOutput.
 * Enforces all invariants and postconditions per SPEC_ENGINE.md and pipeline.md.
 *
 * Preconditions: input validated, providers deterministic, no I/O.
 * Postconditions: output shape, trajectory length, monotonicity, ID population, explainers.
 */
import { EngineInput, EngineOutput } from '../contracts';
import { ProviderBundle } from '../providers';
import {
  deriveEntitlement,
  projectAnnualWageSeries,
  computeAnnualContributions,
  applyAnnualValorization,
  valorizeInitialCapital,
  applyQuarterlyValorization,
  composeBase,
  selectLifeExpectancy,
  pensionCalcs,
  buildOutput,
} from '../functions';

export const Engine = {
  /**
   * Orchestrates the full pension simulation pipeline.
   * @param input Validated EngineInput
   * @param providers ProviderBundle
   * @returns EngineOutput
   */
  calculate(input: EngineInput, providers: ProviderBundle): EngineOutput {
    // Step a: Entitlement context
    const entitlement = deriveEntitlement(input, providers.quarterly, providers.contrib);
    // Step b: Wage projection
    const anchorYear = input.anchorYear ?? 2025;
    const wageSeries = projectAnnualWageSeries(
      input,
      providers.macro,
      anchorYear,
      entitlement.retirementYear
    );
    // Step c: Contributions
    const contributions = computeAnnualContributions(
      wageSeries,
      providers.contrib,
      input.absenceFactor ?? providers.contrib.getAbsenceBounds().defaultValue
    );
    // Step d: Annual valorization
    const annualTrajectory = applyAnnualValorization(contributions, providers.annual);
    // Step e: Initial capital
    const initialCapital = valorizeInitialCapital(
      input.accumulatedInitialCapital,
      providers.initial,
      providers.annual,
      entitlement.retirementYear
    );
    // Step f: Quarterly valorization
    const finalization = applyQuarterlyValorization(
      annualTrajectory[annualTrajectory.length - 1],
      entitlement.entitlementQuarter,
      { year: entitlement.retirementYear, month: entitlement.claimMonth },
      providers.quarterly
    );
    // Step g: Compose base
    const subAccountAdjusted =
      input.subAccountBalance !== undefined && providers.subAccount
        ? providers.subAccount.valorize(input.subAccountBalance, {
            y: entitlement.retirementYear,
            m: entitlement.claimMonth,
          }).balance
        : undefined;
    const base = composeBase(
      annualTrajectory[annualTrajectory.length - 1].cumulativeCapitalAfterAnnual,
      finalization,
      initialCapital,
      subAccountAdjusted
    );
    // Step h: Life expectancy
    const life = selectLifeExpectancy(
      input.gender,
      { year: entitlement.retirementYear, month: entitlement.claimMonth },
      providers.life
    );
    // Step i: Pension calculations
    const pension = pensionCalcs(
      base.baseCapital,
      life.years,
      providers.macro,
      { year: entitlement.retirementYear, month: entitlement.claimMonth },
      anchorYear,
      input.currentGrossMonthly
    );
    // Step j: Build output
    const assumptions = {
      engineVersion: 'canon-1.0',
      rateFormat: 'fraction',
      annualIndexSetId: 'DEMO_ANNUAL',
      quarterlyIndexSetId: 'DEMO_QUARTERLY',
      lifeTableId: life.lifeTableId,
      cpiVintageId: 'DEMO_CPI',
      wageVintageId: 'DEMO_WAGE',
      contribRuleId: providers.contrib.getContributionRate().id,
      providerKind: 'DeterministicDemo',
    };
    const explainers = [
      `Engine version: canon-1.0`,
      `Rate format: fractions (e.g., 0.10 for 10%)`,
      `Quarter mapping: claimMonth ${entitlement.claimMonth} → ${entitlement.entitlementQuarter}`,
      `Quarterly sequence: ${entitlement.entitlementQuarter === 'Q1' ? '[Q3 prev]' :
        entitlement.entitlementQuarter === 'Q2' ? '[Q3 prev, Q4 prev]' :
        entitlement.entitlementQuarter === 'Q3' ? '[Q3 prev, Q4 prev, Q1 curr]' :
        '[Q3 prev, Q4 prev, Q1 curr, Q2 curr]'}`,
      `SDŻ table window: ${life.lifeTableId}`,
      `Annual valorization precedes quarterly in final year`,
      `Initial capital special index: ${
        initialCapital.steps.find((s) => s.indexId.startsWith('INIT.1999'))
          ? '1.1560 (115.60%) applied'
          : 'not applied'
      }`,
    ];
    return buildOutput({
      scenario: {
        retirementAge: entitlement.retirementAge,
        retirementYear: entitlement.retirementYear,
        claimMonth: entitlement.claimMonth,
        gender: input.gender,
      },
      annualTrajectory,
      finalization,
      base,
      life,
      pension,
      assumptions,
      explainers,
    });
  },
};

/**
 * Helper to build an engine with demo providers for tests/sandbox
 */
import { makeDemoProviderBundle } from '../providers-impl/demo/demo-bundle';
export function buildEngineWithDemoProviders(config?: {
  anchorYear?: number;
}): (input: EngineInput) => EngineOutput {
  const providers = makeDemoProviderBundle(config);
  return (input: EngineInput) => Engine.calculate(input, providers);
}
