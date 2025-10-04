/**
 * pensionCalcs
 * Computes nominal, real, and replacement pension values
 * - No rounding; raw values only
 *
 * SPEC_ENGINE.md: Section H
 * pipeline.md: Step 9–11
 */
import { MacroProjectionProvider } from '../providers';

export interface PensionCalcsResult {
  monthlyPensionNominal: number;
  monthlyPensionRealToday: number;
  replacementRate: number;
}

export function pensionCalcs(
  baseCapital: number,
  lifeExpectancyYears: number,
  macroProvider: MacroProjectionProvider,
  claimDate: { year: number; month: number },
  anchorYear: number,
  currentGrossMonthly: number
): PensionCalcsResult {
  const months = lifeExpectancyYears * 12;
  const monthlyPensionNominal = baseCapital / months;
  const cpiDiscount = macroProvider.getCpiDiscountFactor(
    claimDate.year,
    claimDate.month,
    anchorYear
  );
  const monthlyPensionRealToday = monthlyPensionNominal * cpiDiscount;
  const replacementRate = monthlyPensionRealToday / currentGrossMonthly;
  return {
    monthlyPensionNominal,
    monthlyPensionRealToday,
    replacementRate,
  };
}
