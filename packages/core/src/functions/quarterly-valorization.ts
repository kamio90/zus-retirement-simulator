/**
 * applyQuarterlyValorization
 * Applies quarterly indices for finalization, compounding order per spec.
 * - Selects indices per entitlement quarter mapping
 * - Compounds in correct order
 *
 * SPEC_ENGINE.md: Section E
 * pipeline.md: Step 6
 */
import { AnnualValorizedState } from './annual-valorization';
import { QuarterlyValorizationProvider } from '../providers';
import { assertQuarterlyIndices } from '../utils/assert';

export interface FinalizationStep {
  quarterUsed: 'Q1'|'Q2'|'Q3'|'Q4';
  indicesApplied: string[];
  resultingCapital: number;
}

export function applyQuarterlyValorization(
  lastAnnualState: AnnualValorizedState,
  entitlementQuarter: 'Q1'|'Q2'|'Q3'|'Q4',
  claimDate: { year: number; month: number },
  quarterlyProvider: QuarterlyValorizationProvider
): FinalizationStep {
  // Mapping per SPEC_ENGINE.md
  const year = claimDate.year;
  let indices: { id: string; rate: number }[] = [];
  if (entitlementQuarter === 'Q1') {
    indices = [quarterlyProvider.getQuarterIndex(year - 1, 'Q3')];
  } else if (entitlementQuarter === 'Q2') {
    indices = [quarterlyProvider.getQuarterIndex(year - 1, 'Q4')];
  } else if (entitlementQuarter === 'Q3') {
    indices = [quarterlyProvider.getQuarterIndex(year, 'Q1')];
  } else if (entitlementQuarter === 'Q4') {
    indices = [quarterlyProvider.getQuarterIndex(year, 'Q2')];
  }
  indices.forEach(idx => assertQuarterlyIndices(idx, year));
  let capital = lastAnnualState.cumulativeCapitalAfterAnnual;
  indices.forEach(idx => {
    capital *= idx.rate;
  });
  return {
    quarterUsed: entitlementQuarter,
    indicesApplied: indices.map(i => i.id),
    resultingCapital: capital,
  };
}
