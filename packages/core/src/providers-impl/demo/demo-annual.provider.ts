// Demo Annual Valorization Provider
// Returns annual valorization indices as FRACTIONS (e.g., 0.10 for 10%)
// Applied as: capital * (1 + fraction)
// SPEC_ENGINE.md: Section D (Annual valorization)
import { AnnualValorizationProvider } from '../../providers';

export class DemoAnnualValorizationProvider implements AnnualValorizationProvider {
  getAnnualIndex(year: number): { id: string; rate: number } {
    // Simple constant annual index for demo (10% per year)
    // In production, this would come from actual ZUS tables
    const rate = 0.10; // 10% as fraction
    return {
      id: `ANNUAL.Y${year}`,
      rate,
    };
  }
}
