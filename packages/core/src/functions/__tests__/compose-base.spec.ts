/**
 * Unit tests for composeBase
 * Tests capital composition and aggregation logic
 */
import { composeBase } from '../compose-base';
import { FinalizationStep } from '../quarterly-valorization';
import { ValorizedInitialCapital } from '../initial-capital';

describe('composeBase', () => {
  describe('happy path', () => {
    it('should compose base capital from all components', () => {
      const annualCapital = 500000;
      const finalization: FinalizationStep = {
        quarterUsed: 'Q2',
        indicesApplied: ['QUARTERLY.2024.Q4'],
        resultingCapital: 505000,
      };
      const initial: ValorizedInitialCapital = {
        amount: 100000,
        steps: [
          { year: 1999, indexId: 'INIT.1999', amount: 60000 },
          { year: 2000, indexId: 'ANNUAL.2000', amount: 100000 },
        ],
      };

      const result = composeBase(annualCapital, finalization, initial);

      expect(result.baseCapital).toBeGreaterThanOrEqual(0);
      expect(result.components.contributions).toBe(finalization.resultingCapital);
      expect(result.components.initialCapital).toBe(initial.amount);
      expect(result.components.subAccount).toBeUndefined();
    });

    it('should include subAccount when provided', () => {
      const annualCapital = 500000;
      const finalization: FinalizationStep = {
        quarterUsed: 'Q2',
        indicesApplied: ['QUARTERLY.2024.Q4'],
        resultingCapital: 505000,
      };
      const initial: ValorizedInitialCapital = {
        amount: 100000,
        steps: [],
      };
      const subAccount = 50000;

      const result = composeBase(annualCapital, finalization, initial, subAccount);

      expect(result.baseCapital).toBeGreaterThanOrEqual(0);
      expect(result.components.subAccount).toBe(50000);
    });
  });

  describe('edge cases', () => {
    it('should handle zero contributions', () => {
      const annualCapital = 0;
      const finalization: FinalizationStep = {
        quarterUsed: 'Q1',
        indicesApplied: ['QUARTERLY.2024.Q3'],
        resultingCapital: 0,
      };
      const initial: ValorizedInitialCapital = {
        amount: 100000,
        steps: [],
      };

      const result = composeBase(annualCapital, finalization, initial);

      expect(result.baseCapital).toBe(100000);
      expect(result.components.contributions).toBe(0);
      expect(result.components.initialCapital).toBe(100000);
    });

    it('should handle zero initial capital', () => {
      const annualCapital = 500000;
      const finalization: FinalizationStep = {
        quarterUsed: 'Q2',
        indicesApplied: ['QUARTERLY.2024.Q4'],
        resultingCapital: 505000,
      };
      const initial: ValorizedInitialCapital = {
        amount: 0,
        steps: [],
      };

      const result = composeBase(annualCapital, finalization, initial);

      expect(result.baseCapital).toBe(505000);
      expect(result.components.contributions).toBe(505000);
      expect(result.components.initialCapital).toBe(0);
    });

    it('should handle zero subAccount', () => {
      const annualCapital = 500000;
      const finalization: FinalizationStep = {
        quarterUsed: 'Q2',
        indicesApplied: ['QUARTERLY.2024.Q4'],
        resultingCapital: 505000,
      };
      const initial: ValorizedInitialCapital = {
        amount: 100000,
        steps: [],
      };
      const subAccount = 0;

      const result = composeBase(annualCapital, finalization, initial, subAccount);

      expect(result.baseCapital).toBe(605000);
      expect(result.components.subAccount).toBe(0);
    });

    it('should handle all zeros', () => {
      const annualCapital = 0;
      const finalization: FinalizationStep = {
        quarterUsed: 'Q1',
        indicesApplied: ['QUARTERLY.2024.Q3'],
        resultingCapital: 0,
      };
      const initial: ValorizedInitialCapital = {
        amount: 0,
        steps: [],
      };

      const result = composeBase(annualCapital, finalization, initial, 0);

      expect(result.baseCapital).toBe(0);
    });
  });

  describe('invariants', () => {
    it('should ensure base capital equals sum of components', () => {
      const annualCapital = 500000;
      const finalization: FinalizationStep = {
        quarterUsed: 'Q2',
        indicesApplied: ['QUARTERLY.2024.Q4'],
        resultingCapital: 505000,
      };
      const initial: ValorizedInitialCapital = {
        amount: 100000,
        steps: [],
      };
      const subAccount = 50000;

      const result = composeBase(annualCapital, finalization, initial, subAccount);

      const expectedSum =
        result.components.contributions +
        result.components.initialCapital +
        (result.components.subAccount ?? 0);

      expect(result.baseCapital).toBeCloseTo(expectedSum, 2);
    });

    it('should ensure base capital is non-negative', () => {
      const annualCapital = 500000;
      const finalization: FinalizationStep = {
        quarterUsed: 'Q2',
        indicesApplied: ['QUARTERLY.2024.Q4'],
        resultingCapital: 505000,
      };
      const initial: ValorizedInitialCapital = {
        amount: 100000,
        steps: [],
      };

      const result = composeBase(annualCapital, finalization, initial);

      expect(result.baseCapital).toBeGreaterThanOrEqual(0);
    });

    it('should preserve component values', () => {
      const annualCapital = 500000;
      const finalization: FinalizationStep = {
        quarterUsed: 'Q2',
        indicesApplied: ['QUARTERLY.2024.Q4'],
        resultingCapital: 505000,
      };
      const initial: ValorizedInitialCapital = {
        amount: 100000,
        steps: [],
      };

      const result = composeBase(annualCapital, finalization, initial);

      expect(result.components.contributions).toBe(finalization.resultingCapital);
      expect(result.components.initialCapital).toBe(initial.amount);
    });
  });
});
