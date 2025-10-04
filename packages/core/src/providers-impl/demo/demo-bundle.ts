// Demo Provider Bundle
// Aggregates all demo providers for engine consumption
// SPEC_ENGINE.md: Section Providers
import { DemoAnnualValorizationProvider } from './demo-annual.provider';
import { DemoQuarterlyValorizationProvider } from './demo-quarterly.provider';
import { DemoInitialCapitalProvider } from './demo-initial-capital.provider';
import { DemoLifeExpectancyProvider } from './demo-life-expectancy.provider';
import { DemoMacroProjectionProvider } from './demo-macro.provider';
import { DemoContributionRuleProvider } from './demo-contribution.provider';
import { DemoSubAccountProvider } from './demo-subaccount.provider';
import { ProviderBundle } from '../../providers';

export function makeDemoProviderBundle(_config?: { anchorYear?: number }): ProviderBundle {
  return {
    annual: new DemoAnnualValorizationProvider(),
    quarterly: new DemoQuarterlyValorizationProvider(),
    initial: new DemoInitialCapitalProvider(),
    life: new DemoLifeExpectancyProvider(),
    macro: new DemoMacroProjectionProvider(),
    contrib: new DemoContributionRuleProvider(),
    subAccount: new DemoSubAccountProvider(),
  };
}
