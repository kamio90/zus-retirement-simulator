/**
 * Comparative Validator Utility
 * Validates comparative relationships between engine outputs
 */

import { EngineOutput } from '../../src/contracts';

type ComparisonRelation = 'GT' | 'LT' | 'GTE' | 'LTE' | 'EQ';

/**
 * Validate comparative relationship between two outputs
 */
export function validateComparative(
  outputA: EngineOutput,
  outputB: EngineOutput,
  comparison: { property: string; relation: ComparisonRelation }
): void {
  const valueA = (outputA as any)[comparison.property];
  const valueB = (outputB as any)[comparison.property];

  switch (comparison.relation) {
    case 'GT':
      expect(valueB).toBeGreaterThan(valueA);
      break;
    case 'LT':
      expect(valueB).toBeLessThan(valueA);
      break;
    case 'GTE':
      expect(valueB).toBeGreaterThanOrEqual(valueA);
      break;
    case 'LTE':
      expect(valueB).toBeLessThanOrEqual(valueA);
      break;
    case 'EQ':
      expect(valueB).toBe(valueA);
      break;
    default:
      throw new Error(`Unknown comparison relation: ${comparison.relation}`);
  }
}
