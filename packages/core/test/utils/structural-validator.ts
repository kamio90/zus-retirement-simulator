/**
 * Structural Validator Utility
 * Validates EngineOutput against structural expectations
 */

import { EngineOutput } from '../../src/contracts';
import { StructuralExpectations } from './fixture-loader';

/**
 * Validate engine output against structural expectations
 */
export function validateStructural(
  output: EngineOutput,
  expected: StructuralExpectations
): void {
  // Trajectory length
  if (expected.trajectoryLength !== undefined) {
    expect(output.capitalTrajectory.length).toBe(expected.trajectoryLength);
  }

  // Trajectory monotonicity
  if (expected.trajectoryMonotonic) {
    const capitals = output.capitalTrajectory.map((t) => t.cumulativeCapitalAfterAnnual);
    for (let i = 1; i < capitals.length; i++) {
      expect(capitals[i]).toBeGreaterThanOrEqual(capitals[i - 1]);
    }
  }

  // Nominal pension bounds
  if (expected.minNominal !== undefined) {
    expect(output.monthlyPensionNominal).toBeGreaterThanOrEqual(expected.minNominal);
  }

  if (expected.maxNominal !== undefined) {
    expect(output.monthlyPensionNominal).toBeLessThanOrEqual(expected.maxNominal);
  }

  // Replacement rate bounds
  if (expected.minReplacementRate !== undefined) {
    expect(output.replacementRate).toBeGreaterThanOrEqual(expected.minReplacementRate);
  }

  if (expected.maxReplacementRate !== undefined) {
    expect(output.replacementRate).toBeLessThanOrEqual(expected.maxReplacementRate);
  }

  // Annual index ID pattern
  if (expected.annualIndexIdPattern) {
    const pattern = new RegExp(expected.annualIndexIdPattern);
    output.capitalTrajectory.forEach((t) => {
      expect(t.annualValorizationIndex.toString()).toMatch(pattern);
    });
  }

  // Quarterly index ID pattern
  if (expected.quarterlyIndexIdPattern) {
    const pattern = new RegExp(expected.quarterlyIndexIdPattern);
    expect(output.finalization.quarterIndexId).toMatch(pattern);
  }

  // Life table ID pattern
  if (expected.lifeTableIdPattern) {
    const pattern = new RegExp(expected.lifeTableIdPattern);
    expect(output.assumptions.lifeTableId).toMatch(pattern);
  }

  // Finalization quarter count
  if (expected.finalizationQuarterCount !== undefined) {
    expect(output.finalization.indicesApplied.length).toBe(expected.finalizationQuarterCount);
  }

  // Finalization quarter
  if (expected.finalizationQuarter) {
    expect(output.finalization.quarterUsed).toBe(expected.finalizationQuarter);
  }

  // Explainer contains
  if (expected.explainerContains) {
    expected.explainerContains.forEach((text) => {
      expect(output.explainers.some((e) => e.includes(text))).toBe(true);
    });
  }

  // Explainer minimum length
  if (expected.explainerMinLength !== undefined) {
    expect(output.explainers.length).toBeGreaterThanOrEqual(expected.explainerMinLength);
  }
}
