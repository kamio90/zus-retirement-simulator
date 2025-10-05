/**
 * applyAnnualValorization
 * Compounds annual indices for each year, applies cutoff/order per spec.
 * - Applies index for Y-1 to contributions posted by 31 Jan of Y
 * - Indices are FRACTIONS (e.g., 0.10 for 10%), applied as (1 + fraction)
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
    
    // Guard: annual index should be a fraction in reasonable range
    if (idx.rate < -0.5 || idx.rate > 1.0) {
      throw new Error(`ANNUAL_INDEX_OUT_OF_RANGE: ${idx.rate} at ${idx.id}`);
    }
    
    // Apply as (1 + fraction)
    capital = (capital + annualContribution) * (1 + idx.rate);
    return {
      year,
      contributionAdded: annualContribution,
      annualIndexAppliedId: idx.id,
      cumulativeCapitalAfterAnnual: capital,
    };
  });
}
