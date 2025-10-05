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
  quarterUsed: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  indicesApplied: string[];
  resultingCapital: number;
}

export function applyQuarterlyValorization(
  lastAnnualState: AnnualValorizedState,
  entitlementQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4',
  claimDate: { year: number; month: number },
  quarterlyProvider: QuarterlyValorizationProvider
): FinalizationStep {
  // Canonical quarterly sequence per issue spec
  // Q1: [Q3 prev]
  // Q2: [Q3 prev, Q4 prev]
  // Q3: [Q3 prev, Q4 prev, Q1 curr]
  // Q4: [Q3 prev, Q4 prev, Q1 curr, Q2 curr]
  const year = claimDate.year;
  const prevYear = year - 1;
  let indices: { id: string; rate: number }[] = [];
  
  if (entitlementQuarter === 'Q1') {
    indices = [quarterlyProvider.getQuarterIndex(prevYear, 'Q3')];
  } else if (entitlementQuarter === 'Q2') {
    indices = [
      quarterlyProvider.getQuarterIndex(prevYear, 'Q3'),
      quarterlyProvider.getQuarterIndex(prevYear, 'Q4'),
    ];
  } else if (entitlementQuarter === 'Q3') {
    indices = [
      quarterlyProvider.getQuarterIndex(prevYear, 'Q3'),
      quarterlyProvider.getQuarterIndex(prevYear, 'Q4'),
      quarterlyProvider.getQuarterIndex(year, 'Q1'),
    ];
  } else if (entitlementQuarter === 'Q4') {
    indices = [
      quarterlyProvider.getQuarterIndex(prevYear, 'Q3'),
      quarterlyProvider.getQuarterIndex(prevYear, 'Q4'),
      quarterlyProvider.getQuarterIndex(year, 'Q1'),
      quarterlyProvider.getQuarterIndex(year, 'Q2'),
    ];
  }
  
  indices.forEach((idx) => assertQuarterlyIndices(idx, year));
  
  // Apply indices as (1 + fraction) compounding
  let capital = lastAnnualState.cumulativeCapitalAfterAnnual;
  indices.forEach((idx) => {
    // Guard: index should be a fraction, typically -0.3 to 0.5
    if (idx.rate < -0.3 || idx.rate > 0.5) {
      throw new Error(`QUARTERLY_INDEX_OUT_OF_RANGE: ${idx.rate} at ${idx.id}`);
    }
    capital *= (1 + idx.rate);
  });
  
  return {
    quarterUsed: entitlementQuarter,
    indicesApplied: indices.map((i) => i.id),
    resultingCapital: capital,
  };
}
