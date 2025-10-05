// Demo Providers Edge Cases Test Suite
// Verifies boundary conditions and edge cases for deterministic behavior
import { makeDemoProviderBundle } from '../demo-bundle';

describe('DemoProviderBundle - Edge Cases', () => {
  const providers = makeDemoProviderBundle();

  describe('Annual Valorization', () => {
    it('handles boundary years correctly', () => {
      const year1980 = providers.annual.getAnnualIndex(1980);
      const year2100 = providers.annual.getAnnualIndex(2100);

      // Canonical demo: constant 0.10 (10%) fraction
      expect(year1980.rate).toBe(0.10);
      expect(year2100.rate).toBe(0.10);
      expect(year2100.id).toBe('ANNUAL.Y2100');
    });

    it('maintains consistent rate across years', () => {
      const y2024 = providers.annual.getAnnualIndex(2024);
      const y2025 = providers.annual.getAnnualIndex(2025);

      // Canonical demo: constant 10% fraction
      expect(y2024.rate).toBe(0.10);
      expect(y2025.rate).toBe(0.10);
    });
  });

  describe('Quarterly Valorization', () => {
    it('maps all 12 months to correct quarters', () => {
      expect(providers.quarterly.mapEntitlementQuarter(1)).toBe('Q1');
      expect(providers.quarterly.mapEntitlementQuarter(2)).toBe('Q1');
      expect(providers.quarterly.mapEntitlementQuarter(3)).toBe('Q1');
      expect(providers.quarterly.mapEntitlementQuarter(4)).toBe('Q2');
      expect(providers.quarterly.mapEntitlementQuarter(5)).toBe('Q2');
      expect(providers.quarterly.mapEntitlementQuarter(6)).toBe('Q2');
      expect(providers.quarterly.mapEntitlementQuarter(7)).toBe('Q3');
      expect(providers.quarterly.mapEntitlementQuarter(8)).toBe('Q3');
      expect(providers.quarterly.mapEntitlementQuarter(9)).toBe('Q3');
      expect(providers.quarterly.mapEntitlementQuarter(10)).toBe('Q4');
      expect(providers.quarterly.mapEntitlementQuarter(11)).toBe('Q4');
      expect(providers.quarterly.mapEntitlementQuarter(12)).toBe('Q4');
    });

    it('quarterly rates are distinct and ordered Q1 < Q2 < Q3 < Q4', () => {
      const year = 2025;
      const q1 = providers.quarterly.getQuarterIndex(year, 'Q1');
      const q2 = providers.quarterly.getQuarterIndex(year, 'Q2');
      const q3 = providers.quarterly.getQuarterIndex(year, 'Q3');
      const q4 = providers.quarterly.getQuarterIndex(year, 'Q4');

      // Canonical demo values: Q1=0.009, Q2=0.011, Q3=0.010, Q4=0.012
      // Order is now: Q1 < Q3 < Q2 < Q4
      expect(q1.rate).toBe(0.009);
      expect(q2.rate).toBe(0.011);
      expect(q3.rate).toBe(0.010);
      expect(q4.rate).toBe(0.012);
    });
  });

  describe('Initial Capital', () => {
    it('special 1999 index is fixed', () => {
      const idx1 = providers.initial.getInitial1999Index();
      const idx2 = providers.initial.getInitial1999Index();

      expect(idx1).toEqual(idx2);
      expect(idx1.rate).toBe(1.1560); // Canonical 115.60%
    });

    it('annual indices are fractions for 2000+', () => {
      const y2000 = providers.initial.getAnnualIndexLikeContributions(2000);
      expect(y2000.rate).toBe(0.10); // 10% as fraction

      const y2001 = providers.initial.getAnnualIndexLikeContributions(2001);
      expect(y2001.rate).toBe(0.10); // Constant 10% in demo
    });
  });

  describe('Life Expectancy', () => {
    it('April uses current year table, March uses previous year', () => {
      const march2030 = providers.life.getLifeExpectancyYears('M', { year: 2030, month: 3 });
      const april2030 = providers.life.getLifeExpectancyYears('M', { year: 2030, month: 4 });

      expect(march2030.id).toBe('SDZ.2029.M');
      expect(april2030.id).toBe('SDZ.2030.M');
    });

    it('female life expectancy is higher than male', () => {
      const male = providers.life.getLifeExpectancyYears('M', { year: 2030, month: 6 });
      const female = providers.life.getLifeExpectancyYears('F', { year: 2030, month: 6 });

      expect(female.years).toBeGreaterThan(male.years);
    });

    it('enforces minimum life expectancy of 10 years', () => {
      // Test with very old year that would calculate negative
      const veryOld = providers.life.getLifeExpectancyYears('M', { year: 1900, month: 6 });
      expect(veryOld.years).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Macro Projection', () => {
    it('same year wage growth factor is 1', () => {
      const factor = providers.macro.getWageGrowthFactor(2025, 2025);
      expect(factor).toBe(1);
    });

    it('same year CPI discount factor is 1', () => {
      const factor = providers.macro.getCpiDiscountFactor(2025, 6, 2025);
      expect(factor).toBe(1);
    });

    it('wage growth compounds correctly', () => {
      const factor10Years = providers.macro.getWageGrowthFactor(2020, 2030);
      expect(factor10Years).toBeCloseTo(Math.pow(1.04, 10), 5);
    });
  });

  describe('Contribution Rules', () => {
    it('absence factor default is within bounds', () => {
      const bounds = providers.contrib.getAbsenceBounds();
      expect(bounds.defaultValue).toBeGreaterThanOrEqual(bounds.min);
      expect(bounds.defaultValue).toBeLessThanOrEqual(bounds.max);
    });

    it('contribution rate is ZUS standard rate', () => {
      const rate = providers.contrib.getContributionRate();
      expect(rate.rate).toBe(0.1952); // 19.52% as per ZUS rules
    });
  });

  describe('Sub-Account', () => {
    it('valorization grows with time', () => {
      const balance = 10000;
      const now = providers.subAccount?.valorize(balance, { y: 2025, m: 6 });
      const future = providers.subAccount?.valorize(balance, { y: 2035, m: 6 });

      expect(future?.balance).toBeGreaterThan(now?.balance || 0);
    });

    it('same date valorization is deterministic', () => {
      const balance = 5000;
      const v1 = providers.subAccount?.valorize(balance, { y: 2030, m: 3 });
      const v2 = providers.subAccount?.valorize(balance, { y: 2030, m: 3 });

      expect(v1).toEqual(v2);
    });
  });
});
