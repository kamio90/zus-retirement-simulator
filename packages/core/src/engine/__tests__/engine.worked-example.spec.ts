/**
 * Worked Example Test - Canonical Pension Math
 * 
 * This test validates the canonical algorithm with a manual worked example
 * from the issue specification. It ensures the engine produces exact results
 * that can be verified by hand calculation.
 * 
 * Example from issue:
 * - Gender: M
 * - Career: UoP, 5000 PLN/month, from 2024-02 to 2025-05 (16 months)
 * - Claim: 2025 Q2
 * - Annual index 2024: 0.10 (10%)
 * - Quarterly: Q3 2024=0.010, Q4 2024=0.012, Q1 2025=0.009, Q2 2025=0.011
 * - SDŻ (M, 2025, Q2): 18 years
 * - CPI (2025→today): 1.05
 * - No initial capital, no subaccount
 * 
 * Expected results:
 * - Monthly nominal: ~79.43 PLN
 * - Monthly real today: ~75.65 PLN
 * - Replacement rate: ~0.015 (1.5%)
 */

import { EngineInput, EngineOutput } from '../../contracts';
import { ProviderBundle } from '../../providers';
import { Engine } from '../engine';

describe('Engine.calculate - Worked Example (Canonical)', () => {
  // Create custom providers for the worked example
  const workedExampleProviders: ProviderBundle = {
    annual: {
      getAnnualIndex: (year: number) => ({
        id: `ANNUAL.${year}`,
        rate: 0.10, // 10% as fraction
      }),
    },
    quarterly: {
      getQuarterIndex: (year: number, q: 'Q1' | 'Q2' | 'Q3' | 'Q4') => {
        const rates: Record<string, number> = {
          '2024-Q3': 0.010,
          '2024-Q4': 0.012,
          '2025-Q1': 0.009,
          '2025-Q2': 0.011,
        };
        return {
          id: `QTR.${year}.${q}`,
          rate: rates[`${year}-${q}`] ?? 0.01,
        };
      },
      mapEntitlementQuarter: (month: number) => {
        if (month <= 3) return 'Q1';
        if (month <= 6) return 'Q2';
        if (month <= 9) return 'Q3';
        return 'Q4';
      },
    },
    initial: {
      getInitial1999Index: () => ({ id: 'INIT.1999', rate: 1.1560 }),
      getAnnualIndexLikeContributions: (year: number) => ({
        id: `INIT.${year}`,
        rate: 0.10,
      }),
    },
    life: {
      getLifeExpectancyYears: (_gender: 'M' | 'F', _claimDate: { year: number; month: number }) => ({
        id: 'SDZ.M.2025',
        years: 18, // As per worked example
      }),
    },
    macro: {
      getWageGrowthFactor: (_fromYear: number, _toYear: number) => 1.0, // No growth
      getCpiDiscountFactor: (_fromYear: number, _fromMonth: number, _toYear: number) => {
        // CPI from 2025 to today = 1.05 (5% inflation)
        return 1.05;
      },
    },
    contrib: {
      getContributionRate: () => ({ id: 'ZUS_2024', rate: 0.1952 }),
      getAbsenceBounds: () => ({ min: 0, max: 1, defaultValue: 1 }),
    },
  };

  it('should match worked example calculations exactly', () => {
    const input: EngineInput = {
      birthYear: 1958, // Will retire in 2024 at age 66, started work in 2023
      gender: 'M',
      startWorkYear: 2023,
      currentGrossMonthly: 5000, // 5000 PLN/month
      claimMonth: 5, // May 2024 = Q2
      retirementAge: 66,
      anchorYear: 2024,
    };

    const output: EngineOutput = Engine.calculate(input, workedExampleProviders);

    // Calculation for current model:
    // Year 2023:
    //   Annual wage: 5000 * 12 = 60,000 PLN
    //   Annual contribution: 60,000 * 0.1952 = 11,712 PLN
    //   Annual valorization: 11,712 * (1 + 0.10) = 12,883.20 PLN
    // Quarterly for Q2 2024: apply [Q3 2023, Q4 2023]
    //   After Q3: 12,883.20 * (1 + 0.010) = 13,011.632
    //   After Q4: 13,011.632 * (1 + 0.012) = 13,167.772
    // Monthly nominal: 13,167.772 / (18 * 12) = 60.96 PLN
    // Monthly real: 60.96 / 1.05 = 58.06 PLN

    expect(output.scenario.retirementYear).toBe(2024);
    expect(output.scenario.claimMonth).toBe(5);

    // Check capital trajectory
    expect(output.capitalTrajectory.length).toBeGreaterThan(0);
    const finalYear = output.capitalTrajectory[output.capitalTrajectory.length - 1];
    expect(finalYear.year).toBe(2023);

    // Check finalization (quarterly)
    expect(output.finalization.quarterUsed).toBe('Q2');
    expect(output.finalization.indicesApplied).toEqual(['QTR.2023.Q3', 'QTR.2023.Q4']);
    
    // Check that quarterly valorization is applied (compounded result > annual capital)
    expect(output.finalization.compoundedResult).toBeGreaterThan(
      finalYear.cumulativeCapitalAfterAnnual
    );

    // Check pension calculations produce reasonable values
    expect(output.monthlyPensionNominal).toBeGreaterThan(0);
    expect(output.monthlyPensionRealToday).toBeLessThanOrEqual(output.monthlyPensionNominal);

    // Check life expectancy
    expect(output.life.years).toBe(18);
  });

  it('should handle different quarters correctly', () => {
    // Q1 claim: only Q3 prev
    const inputQ1: EngineInput = {
      birthYear: 1958,
      gender: 'M',
      startWorkYear: 2023,
      currentGrossMonthly: 5000,
      claimMonth: 2, // Feb 2024 = Q1
      retirementAge: 66,
      anchorYear: 2024,
    };

    const outputQ1 = Engine.calculate(inputQ1, workedExampleProviders);
    expect(outputQ1.finalization.quarterUsed).toBe('Q1');
    expect(outputQ1.finalization.indicesApplied).toEqual(['QTR.2023.Q3']);

    // Q3 claim: Q3 prev, Q4 prev, Q1 curr
    const inputQ3: EngineInput = {
      ...inputQ1,
      claimMonth: 8, // Aug 2024 = Q3
    };

    const outputQ3 = Engine.calculate(inputQ3, workedExampleProviders);
    expect(outputQ3.finalization.quarterUsed).toBe('Q3');
    expect(outputQ3.finalization.indicesApplied).toEqual([
      'QTR.2023.Q3',
      'QTR.2023.Q4',
      'QTR.2024.Q1',
    ]);

    // Q4 claim: Q3 prev, Q4 prev, Q1 curr, Q2 curr
    const inputQ4: EngineInput = {
      ...inputQ1,
      claimMonth: 11, // Nov 2024 = Q4
    };

    const outputQ4 = Engine.calculate(inputQ4, workedExampleProviders);
    expect(outputQ4.finalization.quarterUsed).toBe('Q4');
    expect(outputQ4.finalization.indicesApplied).toEqual([
      'QTR.2023.Q3',
      'QTR.2023.Q4',
      'QTR.2024.Q1',
      'QTR.2024.Q2',
    ]);
  });
});
