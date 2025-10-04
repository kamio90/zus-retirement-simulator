/**
 * Unit tests for pensionCalcs
 * Tests pension calculation logic (nominal, real, replacement rate)
 */
import { pensionCalcs } from '../pension-calcs';
import { makeDemoProviderBundle } from '../../providers-impl/demo/demo-bundle';

describe('pensionCalcs', () => {
  const providers = makeDemoProviderBundle();

  describe('happy path', () => {
    it('should compute pension values correctly', () => {
      const baseCapital = 1200000;
      const lifeExpectancyYears = 20;
      const claimDate = { year: 2025, month: 6 };
      const anchorYear = 2025;
      const currentGrossMonthly = 5000;

      const result = pensionCalcs(
        baseCapital,
        lifeExpectancyYears,
        providers.macro,
        claimDate,
        anchorYear,
        currentGrossMonthly
      );

      expect(result.monthlyPensionNominal).toBeGreaterThanOrEqual(0);
      expect(result.monthlyPensionRealToday).toBeGreaterThanOrEqual(0);
      expect(result.replacementRate).toBeGreaterThanOrEqual(0);
    });

    it('should compute nominal pension as capital divided by months', () => {
      const baseCapital = 1200000;
      const lifeExpectancyYears = 20;
      const claimDate = { year: 2025, month: 6 };
      const anchorYear = 2025;
      const currentGrossMonthly = 5000;

      const result = pensionCalcs(
        baseCapital,
        lifeExpectancyYears,
        providers.macro,
        claimDate,
        anchorYear,
        currentGrossMonthly
      );

      const expectedMonthly = baseCapital / (lifeExpectancyYears * 12);
      expect(result.monthlyPensionNominal).toBeCloseTo(expectedMonthly, 2);
    });
  });

  describe('edge cases', () => {
    it('should handle zero capital', () => {
      const baseCapital = 0;
      const lifeExpectancyYears = 20;
      const claimDate = { year: 2025, month: 6 };
      const anchorYear = 2025;
      const currentGrossMonthly = 5000;

      const result = pensionCalcs(
        baseCapital,
        lifeExpectancyYears,
        providers.macro,
        claimDate,
        anchorYear,
        currentGrossMonthly
      );

      expect(result.monthlyPensionNominal).toBe(0);
      expect(result.monthlyPensionRealToday).toBe(0);
      expect(result.replacementRate).toBe(0);
    });

    it('should handle small life expectancy', () => {
      const baseCapital = 1200000;
      const lifeExpectancyYears = 1;
      const claimDate = { year: 2025, month: 6 };
      const anchorYear = 2025;
      const currentGrossMonthly = 5000;

      const result = pensionCalcs(
        baseCapital,
        lifeExpectancyYears,
        providers.macro,
        claimDate,
        anchorYear,
        currentGrossMonthly
      );

      const expectedMonthly = baseCapital / 12;
      expect(result.monthlyPensionNominal).toBeCloseTo(expectedMonthly, 2);
    });

    it('should handle large life expectancy', () => {
      const baseCapital = 1200000;
      const lifeExpectancyYears = 50;
      const claimDate = { year: 2025, month: 6 };
      const anchorYear = 2025;
      const currentGrossMonthly = 5000;

      const result = pensionCalcs(
        baseCapital,
        lifeExpectancyYears,
        providers.macro,
        claimDate,
        anchorYear,
        currentGrossMonthly
      );

      const expectedMonthly = baseCapital / (50 * 12);
      expect(result.monthlyPensionNominal).toBeCloseTo(expectedMonthly, 2);
    });
  });

  describe('invariants', () => {
    it('should maintain monotonicity with capital', () => {
      const baseCapital1 = 600000;
      const baseCapital2 = 1200000;
      const lifeExpectancyYears = 20;
      const claimDate = { year: 2025, month: 6 };
      const anchorYear = 2025;
      const currentGrossMonthly = 5000;

      const result1 = pensionCalcs(
        baseCapital1,
        lifeExpectancyYears,
        providers.macro,
        claimDate,
        anchorYear,
        currentGrossMonthly
      );

      const result2 = pensionCalcs(
        baseCapital2,
        lifeExpectancyYears,
        providers.macro,
        claimDate,
        anchorYear,
        currentGrossMonthly
      );

      // Higher capital should yield higher pension
      expect(result2.monthlyPensionNominal).toBeGreaterThan(result1.monthlyPensionNominal);
      expect(result2.monthlyPensionRealToday).toBeGreaterThan(result1.monthlyPensionRealToday);
    });

    it('should maintain inverse relationship with life expectancy', () => {
      const baseCapital = 1200000;
      const lifeExpectancyYears1 = 10;
      const lifeExpectancyYears2 = 20;
      const claimDate = { year: 2025, month: 6 };
      const anchorYear = 2025;
      const currentGrossMonthly = 5000;

      const result1 = pensionCalcs(
        baseCapital,
        lifeExpectancyYears1,
        providers.macro,
        claimDate,
        anchorYear,
        currentGrossMonthly
      );

      const result2 = pensionCalcs(
        baseCapital,
        lifeExpectancyYears2,
        providers.macro,
        claimDate,
        anchorYear,
        currentGrossMonthly
      );

      // Shorter life expectancy should yield higher monthly pension
      expect(result1.monthlyPensionNominal).toBeGreaterThan(result2.monthlyPensionNominal);
    });

    it('should compute replacement rate as ratio of real pension to current wage', () => {
      const baseCapital = 1200000;
      const lifeExpectancyYears = 20;
      const claimDate = { year: 2025, month: 6 };
      const anchorYear = 2025;
      const currentGrossMonthly = 5000;

      const result = pensionCalcs(
        baseCapital,
        lifeExpectancyYears,
        providers.macro,
        claimDate,
        anchorYear,
        currentGrossMonthly
      );

      const expectedRate = result.monthlyPensionRealToday / currentGrossMonthly;
      expect(result.replacementRate).toBeCloseTo(expectedRate, 6);
    });

    it('should always have non-negative values', () => {
      const baseCapital = 1200000;
      const lifeExpectancyYears = 20;
      const claimDate = { year: 2025, month: 6 };
      const anchorYear = 2025;
      const currentGrossMonthly = 5000;

      const result = pensionCalcs(
        baseCapital,
        lifeExpectancyYears,
        providers.macro,
        claimDate,
        anchorYear,
        currentGrossMonthly
      );

      expect(result.monthlyPensionNominal).toBeGreaterThanOrEqual(0);
      expect(result.monthlyPensionRealToday).toBeGreaterThanOrEqual(0);
      expect(result.replacementRate).toBeGreaterThanOrEqual(0);
    });

    it('should be deterministic', () => {
      const baseCapital = 1200000;
      const lifeExpectancyYears = 20;
      const claimDate = { year: 2025, month: 6 };
      const anchorYear = 2025;
      const currentGrossMonthly = 5000;

      const result1 = pensionCalcs(
        baseCapital,
        lifeExpectancyYears,
        providers.macro,
        claimDate,
        anchorYear,
        currentGrossMonthly
      );

      const result2 = pensionCalcs(
        baseCapital,
        lifeExpectancyYears,
        providers.macro,
        claimDate,
        anchorYear,
        currentGrossMonthly
      );

      expect(result1.monthlyPensionNominal).toBe(result2.monthlyPensionNominal);
      expect(result1.monthlyPensionRealToday).toBe(result2.monthlyPensionRealToday);
      expect(result1.replacementRate).toBe(result2.replacementRate);
    });
  });
});
