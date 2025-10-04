/**
 * Unit tests for valorizeInitialCapital
 * Tests initial capital valorization with special 1999 index
 */
import { valorizeInitialCapital } from '../initial-capital';
import { makeDemoProviderBundle } from '../../providers-impl/demo/demo-bundle';

describe('valorizeInitialCapital', () => {
  const providers = makeDemoProviderBundle();

  describe('happy path', () => {
    it('should valorize initial capital correctly', () => {
      const initialCapital = 50000;
      const entitlementYear = 2025;

      const result = valorizeInitialCapital(
        initialCapital,
        providers.initial,
        providers.annual,
        entitlementYear
      );

      expect(result.amount).toBeGreaterThan(0);
      expect(result.steps.length).toBeGreaterThan(0);
    });

    it('should apply special 1999 index first', () => {
      const initialCapital = 50000;
      const entitlementYear = 2025;

      const result = valorizeInitialCapital(
        initialCapital,
        providers.initial,
        providers.annual,
        entitlementYear
      );

      // First step should be 1999
      expect(result.steps[0].year).toBe(1999);
      expect(result.steps[0].indexId).toContain('1999');
    });

    it('should apply annual indices after 1999', () => {
      const initialCapital = 50000;
      const entitlementYear = 2002; // Short period for testing

      const result = valorizeInitialCapital(
        initialCapital,
        providers.initial,
        providers.annual,
        entitlementYear
      );

      // Should have 1999 + (2000, 2001) = 3 steps
      expect(result.steps.length).toBe(3);
      expect(result.steps[0].year).toBe(1999);
      expect(result.steps[1].year).toBe(2000);
      expect(result.steps[2].year).toBe(2001);
    });
  });

  describe('edge cases', () => {
    it('should handle zero initial capital', () => {
      const initialCapital = 0;
      const entitlementYear = 2025;

      const result = valorizeInitialCapital(
        initialCapital,
        providers.initial,
        providers.annual,
        entitlementYear
      );

      expect(result.amount).toBe(0);
      expect(result.steps.length).toBe(0);
    });

    it('should handle undefined initial capital', () => {
      const initialCapital = undefined;
      const entitlementYear = 2025;

      const result = valorizeInitialCapital(
        initialCapital,
        providers.initial,
        providers.annual,
        entitlementYear
      );

      expect(result.amount).toBe(0);
      expect(result.steps.length).toBe(0);
    });

    it('should handle negative initial capital', () => {
      const initialCapital = -1000;
      const entitlementYear = 2025;

      const result = valorizeInitialCapital(
        initialCapital,
        providers.initial,
        providers.annual,
        entitlementYear
      );

      expect(result.amount).toBe(0);
      expect(result.steps.length).toBe(0);
    });

    it('should handle entitlementYear close to 1999', () => {
      const initialCapital = 50000;
      const entitlementYear = 2000; // Only 1999 index applies

      const result = valorizeInitialCapital(
        initialCapital,
        providers.initial,
        providers.annual,
        entitlementYear
      );

      expect(result.steps.length).toBe(1);
      expect(result.steps[0].year).toBe(1999);
    });
  });

  describe('invariants', () => {
    it('should apply 1999 index exactly once', () => {
      const initialCapital = 50000;
      const entitlementYear = 2025;

      const result = valorizeInitialCapital(
        initialCapital,
        providers.initial,
        providers.annual,
        entitlementYear
      );

      const indices1999 = result.steps.filter((step) => step.indexId.includes('1999'));
      expect(indices1999.length).toBe(1);
    });

    it('should have chronological steps', () => {
      const initialCapital = 50000;
      const entitlementYear = 2025;

      const result = valorizeInitialCapital(
        initialCapital,
        providers.initial,
        providers.annual,
        entitlementYear
      );

      for (let i = 1; i < result.steps.length; i++) {
        expect(result.steps[i].year).toBe(result.steps[i - 1].year + 1);
      }
    });

    it('should have all steps with valid index IDs', () => {
      const initialCapital = 50000;
      const entitlementYear = 2025;

      const result = valorizeInitialCapital(
        initialCapital,
        providers.initial,
        providers.annual,
        entitlementYear
      );

      result.steps.forEach((step) => {
        expect(step.indexId).toBeTruthy();
        expect(typeof step.indexId).toBe('string');
        expect(step.amount).toBeGreaterThan(0);
      });
    });

    it('should result in final amount equal to last step', () => {
      const initialCapital = 50000;
      const entitlementYear = 2025;

      const result = valorizeInitialCapital(
        initialCapital,
        providers.initial,
        providers.annual,
        entitlementYear
      );

      if (result.steps.length > 0) {
        expect(result.amount).toBe(result.steps[result.steps.length - 1].amount);
      }
    });
  });
});
