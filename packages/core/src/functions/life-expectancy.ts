/**
 * selectLifeExpectancy
 * Selects SDŻ years and table ID per window/gender
 *
 * SPEC_ENGINE.md: Section H
 * pipeline.md: Step 8
 */
import { LifeExpectancyProvider } from '../providers';

export interface LifeExpectancySelection {
  years: number;
  lifeTableId: string;
}

export function selectLifeExpectancy(
  gender: 'M' | 'F',
  claimDate: { year: number; month: number },
  lifeProvider: LifeExpectancyProvider
): LifeExpectancySelection {
  const result = lifeProvider.getLifeExpectancyYears(gender, claimDate);
  return {
    years: result.years,
    lifeTableId: result.id,
  };
}
