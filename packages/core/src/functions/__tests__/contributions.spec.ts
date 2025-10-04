/**
 * Unit tests for computeAnnualContributions
 * Tests contribution calculation logic using demo providers
 */
import { computeAnnualContributions } from '../contributions';
import { YearlyWage } from '../wages';
import { makeDemoProviderBundle } from '../../providers-impl/demo/demo-bundle';

describe('computeAnnualContributions', () => {
  const providers = makeDemoProviderBundle();

  describe('happy path', () => {
    it('should compute contributions for valid wages', () => {
      const wages: YearlyWage[] = [
        { year: 2010, annualWage: 60000 },
        { year: 2011, annualWage: 65000 },
        { year: 2012, annualWage: 70000 },
      ];
      const absenceFactor = 1.0;

      const result = computeAnnualContributions(wages, providers.contrib, absenceFactor);

      expect(result.length).toBe(wages.length);
      result.forEach((contrib, idx) => {
        expect(contrib.year).toBe(wages[idx].year);
        expect(contrib.annualContribution).toBeGreaterThanOrEqual(0);
      });
    });

    it('should apply contribution rate correctly', () => {
      const wages: YearlyWage[] = [{ year: 2010, annualWage: 100000 }];
      const absenceFactor = 1.0;
      const { rate } = providers.contrib.getContributionRate();

      const result = computeAnnualContributions(wages, providers.contrib, absenceFactor);

      // contribution = wage × rate × absenceFactor
      const expectedContribution = 100000 * rate * absenceFactor;
      expect(result[0].annualContribution).toBeCloseTo(expectedContribution, 2);
    });
  });

  describe('edge cases', () => {
    it('should handle zero wages', () => {
      const wages: YearlyWage[] = [
        { year: 2010, annualWage: 0 },
        { year: 2011, annualWage: 0 },
      ];
      const absenceFactor = 1.0;

      const result = computeAnnualContributions(wages, providers.contrib, absenceFactor);

      result.forEach((contrib) => {
        expect(contrib.annualContribution).toBe(0);
      });
    });

    it('should handle partial absence factor', () => {
      const wages: YearlyWage[] = [{ year: 2010, annualWage: 100000 }];
      const absenceFactor = 0.8; // 80% presence
      const { rate } = providers.contrib.getContributionRate();

      const result = computeAnnualContributions(wages, providers.contrib, absenceFactor);

      const expectedContribution = 100000 * rate * absenceFactor;
      expect(result[0].annualContribution).toBeCloseTo(expectedContribution, 2);
    });

    it('should handle empty wage series', () => {
      const wages: YearlyWage[] = [];
      const absenceFactor = 1.0;

      const result = computeAnnualContributions(wages, providers.contrib, absenceFactor);

      expect(result.length).toBe(0);
    });
  });

  describe('error cases', () => {
    it('should validate absenceFactor bounds', () => {
      const wages: YearlyWage[] = [{ year: 2010, annualWage: 100000 }];

      // Below minimum
      expect(() => computeAnnualContributions(wages, providers.contrib, 0)).toThrow();

      // Above maximum
      expect(() => computeAnnualContributions(wages, providers.contrib, 1.5)).toThrow();
    });
  });

  describe('invariants', () => {
    it('should maintain same length as input', () => {
      const wages: YearlyWage[] = [
        { year: 2010, annualWage: 60000 },
        { year: 2011, annualWage: 65000 },
        { year: 2012, annualWage: 70000 },
        { year: 2013, annualWage: 75000 },
      ];
      const absenceFactor = 1.0;

      const result = computeAnnualContributions(wages, providers.contrib, absenceFactor);

      expect(result.length).toBe(wages.length);
    });

    it('should be linear with wage', () => {
      const baseWage = 100000;
      const wages1: YearlyWage[] = [{ year: 2010, annualWage: baseWage }];
      const wages2: YearlyWage[] = [{ year: 2010, annualWage: baseWage * 2 }];
      const absenceFactor = 1.0;

      const result1 = computeAnnualContributions(wages1, providers.contrib, absenceFactor);
      const result2 = computeAnnualContributions(wages2, providers.contrib, absenceFactor);

      expect(result2[0].annualContribution).toBeCloseTo(result1[0].annualContribution * 2, 2);
    });

    it('should be linear with absenceFactor', () => {
      const wages: YearlyWage[] = [{ year: 2010, annualWage: 100000 }];
      const result1 = computeAnnualContributions(wages, providers.contrib, 1.0);
      const result2 = computeAnnualContributions(wages, providers.contrib, 0.8);

      expect(result2[0].annualContribution).toBeCloseTo(result1[0].annualContribution * 0.8, 2);
    });
  });
});
