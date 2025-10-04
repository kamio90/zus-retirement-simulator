import { buildEngineWithDemoProviders } from '../engine';
import { EngineInput } from '../../contracts';

describe('Engine.calculate (property/metamorphic)', () => {
  const demoEngine = buildEngineWithDemoProviders();

  it('wage increase leads to higher pension', () => {
    const baseInput: EngineInput = {
      birthYear: 1990,
      gender: 'M' as const,
      startWorkYear: 2010,
      currentGrossMonthly: 6000,
      claimMonth: 6,
    };
    const higherWageInput: EngineInput = { ...baseInput, currentGrossMonthly: 6600 };
    const outBase = demoEngine(baseInput);
    const outHigher = demoEngine(higherWageInput);
    expect(outHigher.monthlyPensionNominal).toBeGreaterThanOrEqual(outBase.monthlyPensionNominal);
    expect(outHigher.monthlyPensionRealToday).toBeGreaterThanOrEqual(
      outBase.monthlyPensionRealToday
    );
  });

  it('absenceFactor decrease lowers pension', () => {
    const input1: EngineInput = {
      birthYear: 1990,
      gender: 'M' as const,
      startWorkYear: 2010,
      currentGrossMonthly: 6000,
      absenceFactor: 1.0,
      claimMonth: 6,
    };
    const input2: EngineInput = { ...input1, absenceFactor: 0.95 };
    const out1 = demoEngine(input1);
    const out2 = demoEngine(input2);
    expect(out2.monthlyPensionNominal).toBeLessThanOrEqual(out1.monthlyPensionNominal);
    expect(out2.monthlyPensionRealToday).toBeLessThanOrEqual(out1.monthlyPensionRealToday);
  });

  it('retirementAge +1 year increases nominal pension', () => {
    const inputA: EngineInput = {
      birthYear: 1980,
      gender: 'F' as const,
      startWorkYear: 2000,
      currentGrossMonthly: 7000,
      retirementAge: 60,
      claimMonth: 6,
    };
    const inputB: EngineInput = { ...inputA, retirementAge: 61 };
    const outA = demoEngine(inputA);
    const outB = demoEngine(inputB);
    expect(outB.monthlyPensionNominal).toBeGreaterThanOrEqual(outA.monthlyPensionNominal);
  });

  it('quarterly mapping changes finalization index', () => {
    const inputQ2: EngineInput = {
      birthYear: 1980,
      gender: 'M' as const,
      startWorkYear: 2000,
      currentGrossMonthly: 6000,
      claimMonth: 5,
    };
    const inputQ3: EngineInput = { ...inputQ2, claimMonth: 8 };
    const outQ2 = demoEngine(inputQ2);
    const outQ3 = demoEngine(inputQ3);
    expect(outQ2.finalization.indicesApplied[0]).not.toBe(outQ3.finalization.indicesApplied[0]);
  });

  it('gender/SDŻ effect: F with higher years yields lower monthly pension', () => {
    const inputM: EngineInput = {
      birthYear: 1980,
      gender: 'M' as const,
      startWorkYear: 2000,
      currentGrossMonthly: 6000,
      claimMonth: 6,
    };
    const inputF: EngineInput = { ...inputM, gender: 'F' as const };
    const outM = demoEngine(inputM);
    const outF = demoEngine(inputF);
    if (outF.life.years > outM.life.years) {
      expect(outF.monthlyPensionNominal).toBeLessThanOrEqual(outM.monthlyPensionNominal);
    }
  });

  it('real pension ≤ nominal under inflation', () => {
    const input: EngineInput = {
      birthYear: 1990,
      gender: 'M' as const,
      startWorkYear: 2010,
      currentGrossMonthly: 6000,
      claimMonth: 6,
    };
    const out = demoEngine(input);
    expect(out.monthlyPensionRealToday).toBeLessThanOrEqual(out.monthlyPensionNominal);
  });

  it('idempotence: repeated calls yield identical results', () => {
    const input: EngineInput = {
      birthYear: 1990,
      gender: 'M' as const,
      startWorkYear: 2010,
      currentGrossMonthly: 6000,
      claimMonth: 6,
    };
    const out1 = demoEngine(input);
    const out2 = demoEngine(input);
    expect(out1).toEqual(out2);
  });
});
