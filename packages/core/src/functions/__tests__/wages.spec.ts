/**
 * Unit tests for projectAnnualWageSeries
 * Tests wage projection logic using demo providers
 */
import { projectAnnualWageSeries } from '../wages';
import { makeDemoProviderBundle } from '../../providers-impl/demo/demo-bundle';
import { EngineInput } from '../../contracts';

describe('projectAnnualWageSeries', () => {
  const providers = makeDemoProviderBundle();

  describe('happy path', () => {
    it('should produce wage series for valid input', () => {
      const input: EngineInput = {
        birthYear: 1990,
        gender: 'M',
        startWorkYear: 2010,
        currentGrossMonthly: 5000,
      };
      const anchorYear = 2025;
      const retirementYear = 2055; // age 65

      const result = projectAnnualWageSeries(input, providers.macro, anchorYear, retirementYear);

      // Should have entries for each year from startWorkYear to retirementYear-1
      expect(result.length).toBe(retirementYear - input.startWorkYear);

      // All wages should be non-negative
      result.forEach((wage) => {
        expect(wage.annualWage).toBeGreaterThanOrEqual(0);
      });

      // Years should be chronological
      for (let i = 1; i < result.length; i++) {
        expect(result[i].year).toBe(result[i - 1].year + 1);
      }

      // First year should be startWorkYear
      expect(result[0].year).toBe(input.startWorkYear);
    });
  });

  describe('edge cases', () => {
    it('should handle single year of work', () => {
      const input: EngineInput = {
        birthYear: 1990,
        gender: 'M',
        startWorkYear: 2054,
        currentGrossMonthly: 5000,
      };
      const anchorYear = 2025;
      const retirementYear = 2055;

      const result = projectAnnualWageSeries(input, providers.macro, anchorYear, retirementYear);

      expect(result.length).toBe(1);
      expect(result[0].year).toBe(2054);
      expect(result[0].annualWage).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero monthly wage', () => {
      const input: EngineInput = {
        birthYear: 1990,
        gender: 'M',
        startWorkYear: 2010,
        currentGrossMonthly: 0,
      };
      const anchorYear = 2025;
      const retirementYear = 2055;

      const result = projectAnnualWageSeries(input, providers.macro, anchorYear, retirementYear);

      result.forEach((wage) => {
        expect(wage.annualWage).toBe(0);
      });
    });
  });

  describe('invariants', () => {
    it('should maintain chronological order', () => {
      const input: EngineInput = {
        birthYear: 1985,
        gender: 'F',
        startWorkYear: 2005,
        currentGrossMonthly: 6000,
      };
      const anchorYear = 2025;
      const retirementYear = 2045;

      const result = projectAnnualWageSeries(input, providers.macro, anchorYear, retirementYear);

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i + 1].year).toBe(result[i].year + 1);
      }
    });

    it('should scale with currentGrossMonthly', () => {
      const baseInput: EngineInput = {
        birthYear: 1990,
        gender: 'M',
        startWorkYear: 2010,
        currentGrossMonthly: 5000,
      };
      const doubleInput: EngineInput = {
        ...baseInput,
        currentGrossMonthly: 10000,
      };
      const anchorYear = 2025;
      const retirementYear = 2030;

      const baseResult = projectAnnualWageSeries(
        baseInput,
        providers.macro,
        anchorYear,
        retirementYear
      );
      const doubleResult = projectAnnualWageSeries(
        doubleInput,
        providers.macro,
        anchorYear,
        retirementYear
      );

      for (let i = 0; i < baseResult.length; i++) {
        expect(doubleResult[i].annualWage).toBeCloseTo(baseResult[i].annualWage * 2, 2);
      }
    });
  });
});
