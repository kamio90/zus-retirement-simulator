// Demo Initial Capital Provider
// Implements special 1999 index and annual path for 2000+
// SPEC_ENGINE.md: Section F (Initial capital)
import { InitialCapitalProvider } from '../../providers';

export class DemoInitialCapitalProvider implements InitialCapitalProvider {
  getInitial1999Index(): { id: string; rate: number } {
    // Special index for 1999, applied once on 1 June 2000
    return {
      id: 'INIT.1999',
      rate: 1.15,
    };
  }

  getAnnualIndexLikeContributions(year: number): { id: string; rate: number } {
    // Use same pattern as annual provider
    const baseRate = 1.03;
    const rate = Math.pow(baseRate, year - 2000);
    return {
      id: `INIT.Y${year}`,
      rate,
    };
  }
}
