// Demo Macro Projection Provider
// Wage and CPI paths, geometric compounding
// SPEC_ENGINE.md: Section B (Wage), Section H (CPI)
import { MacroProjectionProvider } from '../../providers';

export class DemoMacroProjectionProvider implements MacroProjectionProvider {
  getWageGrowthFactor(fromYear: number, toYear: number): number {
    // 4% wage growth per year
    const rate = 1.04;
    return Math.pow(rate, toYear - fromYear);
  }

  getCpiDiscountFactor(
    fromClaimYear: number,
    _fromClaimMonth: number,
    toAnchorYear: number
  ): number {
    // 2% inflation per year
    const rate = 1.02;
    return Math.pow(rate, toAnchorYear - fromClaimYear);
  }
}
