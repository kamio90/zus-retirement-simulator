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
  // Guard: base capital must be finite and non-negative
  if (!isFinite(baseCapital) || baseCapital < 0) {
    throw new Error(`INVALID_BASE_CAPITAL: ${baseCapital}`);
  }
  
  // Guard: life expectancy must be positive
  if (!isFinite(lifeExpectancyYears) || lifeExpectancyYears <= 0) {
    throw new Error(`INVALID_LIFE_EXPECTANCY: ${lifeExpectancyYears}`);
  }
  
  const months = lifeExpectancyYears * 12;
  const monthlyPensionNominal = baseCapital / months;
  
  // Guard: nominal pension must be finite
  if (!isFinite(monthlyPensionNominal)) {
    throw new Error(`NUMERIC_OVERFLOW_OR_NAN: nominal=${monthlyPensionNominal}`);
  }
  
  const cpiDiscount = macroProvider.getCpiDiscountFactor(
    claimDate.year,
    claimDate.month,
    anchorYear
  );
  
  // Guard: CPI discount must be positive and finite
  if (!isFinite(cpiDiscount) || cpiDiscount <= 0) {
    throw new Error(`INVALID_CPI_DISCOUNT: ${cpiDiscount}`);
  }
  
  // Divide by CPI discount to get real value (higher CPI = lower real value)
  const monthlyPensionRealToday = monthlyPensionNominal / cpiDiscount;
  
  // Guard: real pension must be finite
  if (!isFinite(monthlyPensionRealToday)) {
    throw new Error(`NUMERIC_OVERFLOW_OR_NAN: real=${monthlyPensionRealToday}`);
  }
  
  const replacementRate = monthlyPensionRealToday / currentGrossMonthly;
  
  return {
    monthlyPensionNominal,
    monthlyPensionRealToday,
    replacementRate,
  };
}
