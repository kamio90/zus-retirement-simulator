// Demo SubAccount Provider (optional)
// Passthrough valorization for MVP
// SPEC_ENGINE.md: Section G (Sub-account)
import { SubAccountProvider } from '../../providers';

export class DemoSubAccountProvider implements SubAccountProvider {
  valorize(balance: number, claimDate: { y: number; m: number }): { id: string; balance: number } {
    // Mild geometric growth, 1% per year
    const years = claimDate.y - 2025;
    const rate = Math.pow(1.01, years);
    return {
      id: `SUBACC.${claimDate.y}`,
      balance: Math.round(balance * rate * 100) / 100,
    };
  }
}
