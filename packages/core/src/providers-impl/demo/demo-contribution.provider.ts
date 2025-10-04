// Demo Contribution Rule Provider
// Contribution rate and absence bounds
// SPEC_ENGINE.md: Section C (Contribution)
import { ContributionRuleProvider } from '../../providers';

export class DemoContributionRuleProvider implements ContributionRuleProvider {
  getContributionRate() {
    return {
      id: 'CONTRIB.DEMO',
      rate: 0.1952,
    };
  }

  getAbsenceBounds() {
    return {
      min: 0.8,
      max: 1.0,
      defaultValue: 0.97,
    };
  }
}
