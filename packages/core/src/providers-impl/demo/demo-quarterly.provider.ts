// Demo Quarterly Valorization Provider
// Distinct indices for Q1..Q4, stable order, documented mapping
// SPEC_ENGINE.md: Section E (Quarterly valorization)
import { QuarterlyValorizationProvider } from '../../providers';

// Quarterly indices as FRACTIONS (not multiplicative rates)
// These will be used as: capital * (1 + fraction)
const QUARTER_BASE_FRACTIONS = {
  Q1: 0.009,  // 0.9%
  Q2: 0.011,  // 1.1%
  Q3: 0.010,  // 1.0%
  Q4: 0.012,  // 1.2%
};

export class DemoQuarterlyValorizationProvider implements QuarterlyValorizationProvider {
  getQuarterIndex(
    calendarYear: number,
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  ): { id: string; rate: number } {
    // Return as fraction directly
    const rate = QUARTER_BASE_FRACTIONS[quarter];
    return {
      id: `QTR.Y${calendarYear}.${quarter}`,
      rate,
    };
  }

  // Maps claimMonth to entitlement quarter per SPEC_ENGINE.md
  mapEntitlementQuarter(claimMonth: number): 'Q1' | 'Q2' | 'Q3' | 'Q4' {
    if ([1, 2, 3].includes(claimMonth)) return 'Q1';
    if ([4, 5, 6].includes(claimMonth)) return 'Q2';
    if ([7, 8, 9].includes(claimMonth)) return 'Q3';
    return 'Q4';
  }
}
