/**
 * Unit tests for selectLifeExpectancy
 * Tests life expectancy selection logic
 */
import { selectLifeExpectancy } from '../life-expectancy';
import { makeDemoProviderBundle } from '../../providers-impl/demo/demo-bundle';

describe('selectLifeExpectancy', () => {
  const providers = makeDemoProviderBundle();

  describe('happy path', () => {
    it('should select life expectancy for male', () => {
      const gender = 'M';
      const claimDate = { year: 2025, month: 6 };

      const result = selectLifeExpectancy(gender, claimDate, providers.life);

      expect(result.years).toBeGreaterThan(0);
      expect(result.lifeTableId).toBeTruthy();
      expect(typeof result.lifeTableId).toBe('string');
    });

    it('should select life expectancy for female', () => {
      const gender = 'F';
      const claimDate = { year: 2025, month: 6 };

      const result = selectLifeExpectancy(gender, claimDate, providers.life);

      expect(result.years).toBeGreaterThan(0);
      expect(result.lifeTableId).toBeTruthy();
      expect(typeof result.lifeTableId).toBe('string');
    });

    it('should select life expectancy for different years', () => {
      const gender = 'M';
      const claimDate1 = { year: 2025, month: 6 };
      const claimDate2 = { year: 2030, month: 6 };

      const result1 = selectLifeExpectancy(gender, claimDate1, providers.life);
      const result2 = selectLifeExpectancy(gender, claimDate2, providers.life);

      expect(result1.years).toBeGreaterThan(0);
      expect(result2.years).toBeGreaterThan(0);
      expect(result1.lifeTableId).toBeTruthy();
      expect(result2.lifeTableId).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle different months in same year', () => {
      const gender = 'M';
      const claimDate1 = { year: 2025, month: 1 };
      const claimDate2 = { year: 2025, month: 12 };

      const result1 = selectLifeExpectancy(gender, claimDate1, providers.life);
      const result2 = selectLifeExpectancy(gender, claimDate2, providers.life);

      expect(result1.years).toBeGreaterThan(0);
      expect(result2.years).toBeGreaterThan(0);
    });
  });

  describe('invariants', () => {
    it('should always return positive years', () => {
      const genders: Array<'M' | 'F'> = ['M', 'F'];
      const years = [2020, 2025, 2030, 2040, 2050];
      const months = [1, 6, 12];

      genders.forEach((gender) => {
        years.forEach((year) => {
          months.forEach((month) => {
            const result = selectLifeExpectancy(gender, { year, month }, providers.life);
            expect(result.years).toBeGreaterThan(0);
          });
        });
      });
    });

    it('should always return valid table ID', () => {
      const gender = 'M';
      const claimDate = { year: 2025, month: 6 };

      const result = selectLifeExpectancy(gender, claimDate, providers.life);

      expect(result.lifeTableId).toBeTruthy();
      expect(typeof result.lifeTableId).toBe('string');
      expect(result.lifeTableId.length).toBeGreaterThan(0);
    });

    it('should be deterministic', () => {
      const gender = 'M';
      const claimDate = { year: 2025, month: 6 };

      const result1 = selectLifeExpectancy(gender, claimDate, providers.life);
      const result2 = selectLifeExpectancy(gender, claimDate, providers.life);

      expect(result1.years).toBe(result2.years);
      expect(result1.lifeTableId).toBe(result2.lifeTableId);
    });

    it('should handle gender differences', () => {
      const claimDate = { year: 2025, month: 6 };

      const resultM = selectLifeExpectancy('M', claimDate, providers.life);
      const resultF = selectLifeExpectancy('F', claimDate, providers.life);

      // Both should have valid results
      expect(resultM.years).toBeGreaterThan(0);
      expect(resultF.years).toBeGreaterThan(0);
      expect(resultM.lifeTableId).toBeTruthy();
      expect(resultF.lifeTableId).toBeTruthy();
    });
  });
});
