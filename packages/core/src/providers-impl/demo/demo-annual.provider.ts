// Demo Annual Valorization Provider
// Implements a strictly positive, monotonic annual index for years 1980..2100
// SPEC_ENGINE.md: Section D (Annual valorization)
import { AnnualValorizationProvider } from '../../providers';

export class DemoAnnualValorizationProvider implements AnnualValorizationProvider {
  getAnnualIndex(year: number) {
    // Stable geometric growth, e.g., 3% per year
    const baseRate = 1.03;
    const rate = Math.pow(baseRate, year - 1980);
    return {
      id: `ANNUAL.Y${year}`,
      rate,
    };
  }
}
