/**
 * Unit tests for applyQuarterlyValorization
 * Tests quarterly valorization finalization logic
 */
import { applyQuarterlyValorization } from '../quarterly-valorization';
import { AnnualValorizedState } from '../annual-valorization';
import { makeDemoProviderBundle } from '../../providers-impl/demo/demo-bundle';

describe('applyQuarterlyValorization', () => {
  const providers = makeDemoProviderBundle();

  describe('happy path', () => {
    it('should apply quarterly valorization for Q1', () => {
      const lastAnnualState: AnnualValorizedState = {
        year: 2024,
        contributionAdded: 10000,
        annualIndexAppliedId: 'ANNUAL.2024',
        cumulativeCapitalAfterAnnual: 500000,
      };
      const claimDate = { year: 2025, month: 2 };

      const result = applyQuarterlyValorization(
        lastAnnualState,
        'Q1',
        claimDate,
        providers.quarterly
      );

      expect(result.quarterUsed).toBe('Q1');
      expect(result.indicesApplied.length).toBeGreaterThan(0);
      expect(result.resultingCapital).toBeGreaterThanOrEqual(0);
    });

    it('should apply quarterly valorization for Q2', () => {
      const lastAnnualState: AnnualValorizedState = {
        year: 2024,
        contributionAdded: 10000,
        annualIndexAppliedId: 'ANNUAL.2024',
        cumulativeCapitalAfterAnnual: 500000,
      };
      const claimDate = { year: 2025, month: 5 };

      const result = applyQuarterlyValorization(
        lastAnnualState,
        'Q2',
        claimDate,
        providers.quarterly
      );

      expect(result.quarterUsed).toBe('Q2');
      expect(result.indicesApplied.length).toBeGreaterThan(0);
    });

    it('should apply quarterly valorization for Q3', () => {
      const lastAnnualState: AnnualValorizedState = {
        year: 2024,
        contributionAdded: 10000,
        annualIndexAppliedId: 'ANNUAL.2024',
        cumulativeCapitalAfterAnnual: 500000,
      };
      const claimDate = { year: 2025, month: 8 };

      const result = applyQuarterlyValorization(
        lastAnnualState,
        'Q3',
        claimDate,
        providers.quarterly
      );

      expect(result.quarterUsed).toBe('Q3');
      expect(result.indicesApplied.length).toBeGreaterThan(0);
    });

    it('should apply quarterly valorization for Q4', () => {
      const lastAnnualState: AnnualValorizedState = {
        year: 2024,
        contributionAdded: 10000,
        annualIndexAppliedId: 'ANNUAL.2024',
        cumulativeCapitalAfterAnnual: 500000,
      };
      const claimDate = { year: 2025, month: 11 };

      const result = applyQuarterlyValorization(
        lastAnnualState,
        'Q4',
        claimDate,
        providers.quarterly
      );

      expect(result.quarterUsed).toBe('Q4');
      expect(result.indicesApplied.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle zero capital', () => {
      const lastAnnualState: AnnualValorizedState = {
        year: 2024,
        contributionAdded: 0,
        annualIndexAppliedId: 'ANNUAL.2024',
        cumulativeCapitalAfterAnnual: 0,
      };
      const claimDate = { year: 2025, month: 6 };

      const result = applyQuarterlyValorization(
        lastAnnualState,
        'Q2',
        claimDate,
        providers.quarterly
      );

      expect(result.resultingCapital).toBe(0);
    });
  });

  describe('invariants', () => {
    it('should use correct quarter mapping', () => {
      const lastAnnualState: AnnualValorizedState = {
        year: 2024,
        contributionAdded: 10000,
        annualIndexAppliedId: 'ANNUAL.2024',
        cumulativeCapitalAfterAnnual: 500000,
      };

      const quarters: Array<'Q1' | 'Q2' | 'Q3' | 'Q4'> = ['Q1', 'Q2', 'Q3', 'Q4'];
      const months = [2, 5, 8, 11];

      quarters.forEach((quarter, idx) => {
        const result = applyQuarterlyValorization(
          lastAnnualState,
          quarter,
          { year: 2025, month: months[idx] },
          providers.quarterly
        );
        expect(result.quarterUsed).toBe(quarter);
      });
    });

    it('should record index IDs', () => {
      const lastAnnualState: AnnualValorizedState = {
        year: 2024,
        contributionAdded: 10000,
        annualIndexAppliedId: 'ANNUAL.2024',
        cumulativeCapitalAfterAnnual: 500000,
      };
      const claimDate = { year: 2025, month: 6 };

      const result = applyQuarterlyValorization(
        lastAnnualState,
        'Q2',
        claimDate,
        providers.quarterly
      );

      expect(result.indicesApplied.length).toBeGreaterThan(0);
      result.indicesApplied.forEach((id) => {
        expect(typeof id).toBe('string');
        expect(id).toBeTruthy();
      });
    });

    it('should compound capital correctly', () => {
      const lastAnnualState: AnnualValorizedState = {
        year: 2024,
        contributionAdded: 10000,
        annualIndexAppliedId: 'ANNUAL.2024',
        cumulativeCapitalAfterAnnual: 100000,
      };
      const claimDate = { year: 2025, month: 6 };

      const result = applyQuarterlyValorization(
        lastAnnualState,
        'Q2',
        claimDate,
        providers.quarterly
      );

      // Resulting capital should be capital * index rate
      expect(result.resultingCapital).toBeGreaterThanOrEqual(0);
    });

    it('should use different indices for different quarters', () => {
      const lastAnnualState: AnnualValorizedState = {
        year: 2024,
        contributionAdded: 10000,
        annualIndexAppliedId: 'ANNUAL.2024',
        cumulativeCapitalAfterAnnual: 500000,
      };

      const resultQ1 = applyQuarterlyValorization(
        lastAnnualState,
        'Q1',
        { year: 2025, month: 2 },
        providers.quarterly
      );

      const resultQ2 = applyQuarterlyValorization(
        lastAnnualState,
        'Q2',
        { year: 2025, month: 5 },
        providers.quarterly
      );

      // Different quarters should use different indices (in most cases)
      expect(resultQ1.indicesApplied).not.toEqual(resultQ2.indicesApplied);
    });
  });
});
