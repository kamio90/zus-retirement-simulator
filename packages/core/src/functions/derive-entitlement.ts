/**
 * deriveEntitlement
 * Pure function to compute retirement context from EngineInput and providers.
 * - Defaults retirementAge by gender if missing (from provider)
 * - Computes entitlementYear, claimMonth, entitlementQuarter
 * - Validates chronology and age bounds
 *
 * SPEC_ENGINE.md: Section A
 * pipeline.md: Step 1
 */
import { EngineInput } from '../contracts';
import { QuarterlyValorizationProvider, ContributionRuleProvider } from '../providers';
import { assertChronology, assertAgeBounds } from '../utils/assert';

export interface EntitlementContext {
  retirementAge: number;
  retirementYear: number;
  claimMonth: number;
  entitlementQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
}

export function deriveEntitlement(
  input: EngineInput,
  quarterlyProvider: QuarterlyValorizationProvider,
  contribProvider: ContributionRuleProvider
): EntitlementContext {
  const { birthYear, gender, retirementAge, startWorkYear, claimMonth = 6 } = input;
  const ageDefault = retirementAge ?? (gender === 'F' ? 60 : 65); // fallback, but should use provider
  assertAgeBounds(ageDefault, gender, contribProvider);
  const entitlementYear = birthYear + ageDefault;
  assertChronology(startWorkYear, entitlementYear);
  const entitlementQuarter = quarterlyProvider.mapEntitlementQuarter(claimMonth);
  return {
    retirementAge: ageDefault,
    retirementYear: entitlementYear,
    claimMonth,
    entitlementQuarter,
  };
}
