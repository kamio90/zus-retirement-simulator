// Demo Life Expectancy Provider
// Table window: 1 Apr–31 Mar, smooth gender-based years
// SPEC_ENGINE.md: Section H (SDŻ)
import { LifeExpectancyProvider } from '../../providers';

export class DemoLifeExpectancyProvider implements LifeExpectancyProvider {
  getLifeExpectancyYears(gender: 'M' | 'F', claimDate: { year: number; month: number }) {
    // Table window: 1 Apr–31 Mar
    const windowYear = claimDate.month >= 4 ? claimDate.year : claimDate.year - 1;
    // Smooth increase by cohort, gender offset
    const base = gender === 'F' ? 22 : 19;
    const years = base + (windowYear - 2025) * 0.05;
    return {
      id: `SDZ.${windowYear}.${gender}`,
      years: Math.max(10, Math.round(years * 100) / 100),
    };
  }
}
