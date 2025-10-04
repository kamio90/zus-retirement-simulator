/**
 * projectAnnualWageSeries
 * Computes YearlyWage[] for [startWorkYear..entitlementYear-1] using macro provider.
 * - Backcasts from anchorYear, forecasts to entitlementYear-1
 * - Uses MacroProjectionProvider.getWageGrowthFactor
 * - No clamping; monotonicity depends on provider
 *
 * SPEC_ENGINE.md: Section B
 * pipeline.md: Step 2
 */
import { EngineInput } from '../contracts';
import { MacroProjectionProvider } from '../providers';

export interface YearlyWage {
  year: number;
  annualWage: number;
}

export function projectAnnualWageSeries(
  input: EngineInput,
  macroProvider: MacroProjectionProvider,
  anchorYear: number,
  retirementYear: number
): YearlyWage[] {
  const { startWorkYear, currentGrossMonthly } = input;
  const years: number[] = [];
  for (let y = startWorkYear; y < retirementYear; y++) years.push(y);
  return years.map(year => {
    const growthFactor = macroProvider.getWageGrowthFactor(anchorYear, year);
    return {
      year,
      annualWage: currentGrossMonthly * 12 * growthFactor,
    };
  });
}
