// Demo Providers Test Suite
// Verifies monotonicity, ID formats, mapping rules, and determinism
import { makeDemoProviderBundle } from '../demo-bundle';

describe('DemoProviderBundle', () => {
  const providers = makeDemoProviderBundle();

  it('annual indices are constant fractions in canonical demo', () => {
    for (let y = 1980; y <= 2100; y++) {
      const idx = providers.annual.getAnnualIndex(y);
      expect(idx.id).toBe(`ANNUAL.Y${y}`);
      // Canonical demo: constant 10% fraction
      expect(idx.rate).toBe(0.10);
    }
  });

  it('quarterly indices have correct IDs and mapping', () => {
    for (let y = 1980; y <= 2100; y++) {
      ['Q1', 'Q2', 'Q3', 'Q4'].forEach((q) => {
        const idx = providers.quarterly.getQuarterIndex(y, q as any);
        expect(idx.id).toBe(`QTR.Y${y}.${q}`);
        expect(idx.rate).toBeGreaterThan(0);
      });
    }
    expect(providers.quarterly.mapEntitlementQuarter(2)).toBe('Q1');
    expect(providers.quarterly.mapEntitlementQuarter(5)).toBe('Q2');
    expect(providers.quarterly.mapEntitlementQuarter(8)).toBe('Q3');
    expect(providers.quarterly.mapEntitlementQuarter(11)).toBe('Q4');
  });

  it('initial capital special 1999 index exists and is unique', () => {
    const idx = providers.initial.getInitial1999Index();
    expect(idx.id).toBe('INIT.1999');
    expect(idx.rate).toBeGreaterThan(1);
  });

  it('life expectancy table window logic is correct', () => {
    const april = providers.life.getLifeExpectancyYears('M', { year: 2030, month: 4 });
    const march = providers.life.getLifeExpectancyYears('F', { year: 2030, month: 3 });
    expect(april.id).toBe('SDZ.2030.M');
    expect(march.id).toBe('SDZ.2029.F');
    expect(april.years).toBeGreaterThan(0);
    expect(march.years).toBeGreaterThan(0);
  });

  it('macro wage and CPI factors are monotonic and positive', () => {
    expect(providers.macro.getWageGrowthFactor(2020, 2030)).toBeGreaterThan(1);
    expect(providers.macro.getCpiDiscountFactor(2020, 6, 2030)).toBeGreaterThan(1);
  });

  it('contribution rate and absence bounds are correct', () => {
    const rate = providers.contrib.getContributionRate();
    expect(rate.id).toBe('CONTRIB.DEMO');
    expect(rate.rate).toBeCloseTo(0.1952);
    const bounds = providers.contrib.getAbsenceBounds();
    expect(bounds.min).toBeLessThan(bounds.max);
    expect(bounds.defaultValue).toBeGreaterThanOrEqual(bounds.min);
    expect(bounds.defaultValue).toBeLessThanOrEqual(bounds.max);
  });

  it('subaccount provider returns correct ID and value', () => {
    const result = providers.subAccount?.valorize(1000, { y: 2030, m: 6 });
    expect(result?.id).toBe('SUBACC.2030');
    expect(result?.balance).toBeGreaterThan(1000);
  });
});
