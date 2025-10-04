import { deriveEntitlement } from '../derive-entitlement';
import { makeDemoProviderBundle } from '../../providers-impl/demo/demo-bundle';

describe('deriveEntitlement', () => {
  const providers = makeDemoProviderBundle();
  it('maps months to correct quarters', () => {
    expect(
      deriveEntitlement(
        {
          birthYear: 1960,
          gender: 'M',
          startWorkYear: 1980,
          currentGrossMonthly: 5000,
          claimMonth: 2,
        },
        providers.quarterly,
        providers.contrib
      ).entitlementQuarter
    ).toBe('Q1');
    expect(
      deriveEntitlement(
        {
          birthYear: 1960,
          gender: 'M',
          startWorkYear: 1980,
          currentGrossMonthly: 5000,
          claimMonth: 5,
        },
        providers.quarterly,
        providers.contrib
      ).entitlementQuarter
    ).toBe('Q2');
    expect(
      deriveEntitlement(
        {
          birthYear: 1960,
          gender: 'M',
          startWorkYear: 1980,
          currentGrossMonthly: 5000,
          claimMonth: 8,
        },
        providers.quarterly,
        providers.contrib
      ).entitlementQuarter
    ).toBe('Q3');
    expect(
      deriveEntitlement(
        {
          birthYear: 1960,
          gender: 'M',
          startWorkYear: 1980,
          currentGrossMonthly: 5000,
          claimMonth: 11,
        },
        providers.quarterly,
        providers.contrib
      ).entitlementQuarter
    ).toBe('Q4');
  });
  it('throws on chronology violation', () => {
    expect(() =>
      deriveEntitlement(
        { birthYear: 1960, gender: 'M', startWorkYear: 2030, currentGrossMonthly: 5000 },
        providers.quarterly,
        providers.contrib
      )
    ).toThrow();
  });
});
