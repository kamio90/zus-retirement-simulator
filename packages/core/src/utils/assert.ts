/**
 * Assertion utilities for pension engine
 * Throws typed domain errors on violation
 * Maps to error codes from packages/types/errors.ts
 */

import { ContributionRuleProvider } from '../providers';

export function assertAgeBounds(
  age: number,
  gender: 'M' | 'F',
  _contribProvider: ContributionRuleProvider
): void {
  // TODO: Use provider for bounds
  if (gender === 'F' && (age < 50 || age > 80))
    throw new Error('VALIDATION_ERROR: Age out of bounds for female');
  if (gender === 'M' && (age < 50 || age > 80))
    throw new Error('VALIDATION_ERROR: Age out of bounds for male');
}

export function assertChronology(startWorkYear: number, entitlementYear: number): void {
  if (startWorkYear > entitlementYear)
    throw new Error('DOMAIN_CONSTRAINT: startWorkYear > entitlementYear');
}

export function assertAbsenceBounds(
  absence: number,
  contribProvider: ContributionRuleProvider
): void {
  const { min, max } = contribProvider.getAbsenceBounds();
  if (absence < min || absence > max)
    throw new Error('VALIDATION_ERROR: Absence factor out of bounds');
}

export function assertAnnualIndices(idx: { id: string; rate: number } | null, year: number): void {
  if (!idx || typeof idx.rate !== 'number')
    throw new Error(`NOT_FOUND: Annual index missing for year ${year}`);
}

export function assertInitialCapital(idx: { id: string; rate: number } | null): void {
  if (!idx || typeof idx.rate !== 'number')
    throw new Error('NOT_FOUND: Initial capital index missing');
}

export function assertQuarterlyIndices(
  idx: { id: string; rate: number } | null,
  year: number
): void {
  if (!idx || typeof idx.rate !== 'number')
    throw new Error(`NOT_FOUND: Quarterly index missing for year ${year}`);
}
