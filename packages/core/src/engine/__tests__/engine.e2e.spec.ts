import { Engine, buildEngineWithDemoProviders } from '../engine';
import { makeDemoProviderBundle } from '../../providers-impl/demo/demo-bundle';

describe('Engine.calculate (integration)', () => {
  const demoEngine = buildEngineWithDemoProviders();

  it('happy path: mid-career male', () => {
    const input = {
      birthYear: 1990,
      gender: 'M',
      startWorkYear: 2010,
      currentGrossMonthly: 6500,
      claimMonth: 6,
    };
    const output = demoEngine(input);
    expect(output.monthlyPensionNominal).toBeGreaterThanOrEqual(0);
    expect(output.monthlyPensionRealToday).toBeGreaterThanOrEqual(0);
    expect(output.replacementRate).toBeGreaterThanOrEqual(0);
    expect(output.replacementRate).toBeLessThanOrEqual(1.5);
    expect(output.capitalTrajectory.length).toBe(output.scenario.retirementYear - input.startWorkYear);
    expect(output.finalization.indicesApplied.length).toBeGreaterThan(0);
    expect(Object.keys(output.assumptions)).toContain('annualIndexSetId');
    expect(output.explainers.length).toBeGreaterThan(0);
  });

  it('happy path: young female with absence', () => {
    const input = {
      birthYear: 1997,
      gender: 'F',
      startWorkYear: 2022,
      currentGrossMonthly: 7000,
      absenceFactor: 0.98,
      claimMonth: 9,
    };
    const output = demoEngine(input);
    expect(output.monthlyPensionNominal).toBeGreaterThanOrEqual(0);
    expect(output.monthlyPensionRealToday).toBeGreaterThanOrEqual(0);
    expect(output.replacementRate).toBeGreaterThanOrEqual(0);
    expect(output.replacementRate).toBeLessThanOrEqual(1.5);
    expect(output.capitalTrajectory.length).toBe(output.scenario.retirementYear - input.startWorkYear);
    expect(output.finalization.indicesApplied.length).toBeGreaterThan(0);
    expect(Object.keys(output.assumptions)).toContain('annualIndexSetId');
    expect(output.explainers.length).toBeGreaterThan(0);
  });

  it('near-retirement with initial capital', () => {
    const input = {
      birthYear: 1966,
      gender: 'M',
      startWorkYear: 1985,
      currentGrossMonthly: 9000,
      accumulatedInitialCapital: 100000,
      claimMonth: 3,
    };
    const output = demoEngine(input);
    expect(output.monthlyPensionNominal).toBeGreaterThanOrEqual(0);
    expect(output.monthlyPensionRealToday).toBeGreaterThanOrEqual(0);
    expect(output.replacementRate).toBeGreaterThanOrEqual(0);
    expect(output.replacementRate).toBeLessThanOrEqual(1.5);
    expect(output.capitalTrajectory.length).toBe(output.scenario.retirementYear - input.startWorkYear);
    expect(output.finalization.indicesApplied.length).toBeGreaterThan(0);
    expect(Object.keys(output.assumptions)).toContain('annualIndexSetId');
    expect(output.explainers.length).toBeGreaterThan(0);
    // Initial capital special index
    expect(output.explainers.some(e => e.includes('Initial capital special index: applied'))).toBe(true);
  });

  it('quarter mapping coverage', () => {
    for (let m = 1; m <= 12; m++) {
      const input = {
        birthYear: 1980,
        gender: 'M',
        startWorkYear: 2000,
        currentGrossMonthly: 6000,
        claimMonth: m,
      };
      const output = demoEngine(input);
      expect(['Q1','Q2','Q3','Q4']).toContain(output.finalization.quarterUsed);
    }
  });

  it('initial capital special rule applied once', () => {
    const input = {
      birthYear: 1970,
      gender: 'F',
      startWorkYear: 1990,
      currentGrossMonthly: 8000,
      accumulatedInitialCapital: 50000,
      claimMonth: 7,
    };
    const output = demoEngine(input);
    // Check explainer for special index
    expect(output.explainers.some(e => e.includes('Initial capital special index: applied'))).toBe(true);
  });

  it('determinism: same input yields same output', () => {
    const input = {
      birthYear: 1985,
      gender: 'M',
      startWorkYear: 2005,
      currentGrossMonthly: 7500,
      claimMonth: 10,
    };
    const out1 = demoEngine(input);
    const out2 = demoEngine(input);
    expect(out1).toEqual(out2);
  });
});
