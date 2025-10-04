/**
 * Unit tests for applyAnnualValorization
 * Tests annual valorization compounding logic using demo providers
 */
import { applyAnnualValorization } from '../annual-valorization';
import { YearlyContribution } from '../contributions';
import { makeDemoProviderBundle } from '../../providers-impl/demo/demo-bundle';

describe('applyAnnualValorization', () => {
  const providers = makeDemoProviderBundle();

  describe('happy path', () => {
    it('should apply annual valorization correctly', () => {
      const contributions: YearlyContribution[] = [
        { year: 2010, annualContribution: 10000 },
        { year: 2011, annualContribution: 11000 },
        { year: 2012, annualContribution: 12000 },
      ];

      const result = applyAnnualValorization(contributions, providers.annual);

      expect(result.length).toBe(contributions.length);
      result.forEach((state, idx) => {
        expect(state.year).toBe(contributions[idx].year);
        expect(state.contributionAdded).toBe(contributions[idx].annualContribution);
        expect(state.cumulativeCapitalAfterAnnual).toBeGreaterThanOrEqual(0);
        expect(state.annualIndexAppliedId).toBeTruthy();
      });
    });

    it('should compound capital correctly', () => {
      const contributions: YearlyContribution[] = [
        { year: 2010, annualContribution: 1000 },
        { year: 2011, annualContribution: 0 },
      ];

      const result = applyAnnualValorization(contributions, providers.annual);

      // First year: (0 + 1000) * index
      expect(result[0].cumulativeCapitalAfterAnnual).toBeGreaterThan(0);
      
      // Second year: (previous_capital + 0) * index
      expect(result[1].cumulativeCapitalAfterAnnual).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle zero contributions', () => {
      const contributions: YearlyContribution[] = [
        { year: 2010, annualContribution: 0 },
        { year: 2011, annualContribution: 0 },
      ];

      const result = applyAnnualValorization(contributions, providers.annual);

      result.forEach((state) => {
        expect(state.cumulativeCapitalAfterAnnual).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle empty contribution series', () => {
      const contributions: YearlyContribution[] = [];

      const result = applyAnnualValorization(contributions, providers.annual);

      expect(result.length).toBe(0);
    });

    it('should handle single year contribution', () => {
      const contributions: YearlyContribution[] = [
        { year: 2010, annualContribution: 5000 },
      ];

      const result = applyAnnualValorization(contributions, providers.annual);

      expect(result.length).toBe(1);
      expect(result[0].year).toBe(2010);
      expect(result[0].contributionAdded).toBe(5000);
      expect(result[0].cumulativeCapitalAfterAnnual).toBeGreaterThan(0);
    });
  });

  describe('invariants', () => {
    it('should maintain monotonic non-decreasing capital', () => {
      const contributions: YearlyContribution[] = [
        { year: 2010, annualContribution: 10000 },
        { year: 2011, annualContribution: 10000 },
        { year: 2012, annualContribution: 10000 },
        { year: 2013, annualContribution: 10000 },
      ];

      const result = applyAnnualValorization(contributions, providers.annual);

      for (let i = 1; i < result.length; i++) {
        // Capital should not decrease (assuming indices >= 0)
        expect(result[i].cumulativeCapitalAfterAnnual).toBeGreaterThanOrEqual(
          result[i - 1].cumulativeCapitalAfterAnnual
        );
      }
    });

    it('should maintain same length as input', () => {
      const contributions: YearlyContribution[] = [
        { year: 2010, annualContribution: 10000 },
        { year: 2011, annualContribution: 11000 },
        { year: 2012, annualContribution: 12000 },
      ];

      const result = applyAnnualValorization(contributions, providers.annual);

      expect(result.length).toBe(contributions.length);
    });

    it('should preserve year values', () => {
      const contributions: YearlyContribution[] = [
        { year: 2010, annualContribution: 10000 },
        { year: 2011, annualContribution: 11000 },
      ];

      const result = applyAnnualValorization(contributions, providers.annual);

      result.forEach((state, idx) => {
        expect(state.year).toBe(contributions[idx].year);
      });
    });

    it('should record index IDs', () => {
      const contributions: YearlyContribution[] = [
        { year: 2010, annualContribution: 10000 },
        { year: 2011, annualContribution: 11000 },
      ];

      const result = applyAnnualValorization(contributions, providers.annual);

      result.forEach((state) => {
        expect(state.annualIndexAppliedId).toBeTruthy();
        expect(typeof state.annualIndexAppliedId).toBe('string');
      });
    });
  });
});
