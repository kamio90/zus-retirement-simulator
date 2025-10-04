// Demo Quarterly Valorization Provider
// Distinct indices for Q1..Q4, stable order, documented mapping
// SPEC_ENGINE.md: Section E (Quarterly valorization)
import { QuarterlyValorizationProvider } from '../../providers';

const QUARTER_BASE_RATES = {
  Q1: 1.007,
  Q2: 1.008,
  Q3: 1.009,
  Q4: 1.01,
};

export class DemoQuarterlyValorizationProvider implements QuarterlyValorizationProvider {
  getQuarterIndex(
    calendarYear: number,
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  ): { id: string; rate: number } {
    const rate = Math.pow(QUARTER_BASE_RATES[quarter], calendarYear - 1980);
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
