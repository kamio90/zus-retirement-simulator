/**
 * applyAnnualValorization
 * Compounds annual indices for each year, applies cutoff/order per spec.
 * - Applies index for Y to contributions posted by 31 Jan of Y
 * - Chronological compounding
 *
 * SPEC_ENGINE.md: Section D
 * pipeline.md: Step 4
 */
import { YearlyContribution } from './contributions';
import { AnnualValorizationProvider } from '../providers';
import { assertAnnualIndices } from '../utils/assert';

export interface AnnualValorizedState {
  year: number;
  contributionAdded: number;
  annualIndexAppliedId: string;
  cumulativeCapitalAfterAnnual: number;
}

export function applyAnnualValorization(
  contributions: YearlyContribution[],
  annualProvider: AnnualValorizationProvider
): AnnualValorizedState[] {
  let capital = 0;
  return contributions.map(({ year, annualContribution }) => {
    const idx = annualProvider.getAnnualIndex(year);
    assertAnnualIndices(idx, year);
    capital = (capital + annualContribution) * idx.rate;
    return {
      year,
      contributionAdded: annualContribution,
      annualIndexAppliedId: idx.id,
      cumulativeCapitalAfterAnnual: capital,
    };
  });
}
