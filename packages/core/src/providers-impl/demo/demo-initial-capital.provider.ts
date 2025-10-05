// Demo Initial Capital Provider
// Implements special 1999 index and annual path for 2000+
// SPEC_ENGINE.md: Section F (Initial capital)
import { InitialCapitalProvider } from '../../providers';

export class DemoInitialCapitalProvider implements InitialCapitalProvider {
  getInitial1999Index(): { id: string; rate: number } {
    // Special index for 1999: 115.60% applied once on 1 June 2000
    // This is a MULTIPLIER, not a fraction
    return {
      id: 'INIT.1999',
      rate: 1.1560,  // 115.60% as multiplier
    };
  }

  getAnnualIndexLikeContributions(year: number): { id: string; rate: number } {
    // After 1999, initial capital follows same annual indices as contributions
    // These are FRACTIONS, applied as (1 + fraction)
    const rate = 0.10; // 10% as fraction (same as demo annual)
    return {
      id: `INIT.Y${year}`,
      rate,
    };
  }
}
