/**
 * computeAnnualContributions
 * Computes YearlyContribution[] aligned to wage rows.
 * - contribution = annualWage × contributionRate × absenceFactor
 * - Validates absenceFactor bounds
 *
 * SPEC_ENGINE.md: Section C
 * pipeline.md: Step 3
 */
import { YearlyWage } from './wages';
import { ContributionRuleProvider } from '../providers';
import { assertAbsenceBounds } from '../utils/assert';

export interface YearlyContribution {
  year: number;
  annualContribution: number;
}

export function computeAnnualContributions(
  wages: YearlyWage[],
  contribProvider: ContributionRuleProvider,
  absenceFactor: number
): YearlyContribution[] {
  const { rate } = contribProvider.getContributionRate();
  assertAbsenceBounds(absenceFactor, contribProvider);
  return wages.map(({ year, annualWage }) => ({
    year,
    annualContribution: annualWage * rate * absenceFactor,
  }));
}
