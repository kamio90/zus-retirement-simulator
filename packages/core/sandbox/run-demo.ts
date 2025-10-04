
import { buildEngineWithDemoProviders } from '../src/engine/engine';

const demoEngine = buildEngineWithDemoProviders();


const scenarios = [
  {
    name: 'Mid-career male',
    input: {
      birthYear: 1990,
      gender: 'M',
      startWorkYear: 2010,
      currentGrossMonthly: 6500,
      claimMonth: 6,
    },
  },
  {
    name: 'Young female',
    input: {
      birthYear: 1997,
      gender: 'F',
      startWorkYear: 2022,
      currentGrossMonthly: 7000,
      absenceFactor: 0.98,
      claimMonth: 9,
    },
  },
  {
    name: 'Near-retirement male with initial capital',
    input: {
      birthYear: 1966,
      gender: 'M',
      startWorkYear: 1985,
      currentGrossMonthly: 9000,
      accumulatedInitialCapital: 120000,
      claimMonth: 3,
    },
  },
];

scenarios.forEach(({ name, input }) => {
  const result = demoEngine(input);
  console.log(`\n=== Scenario: ${name} ===`);
  console.log(JSON.stringify({
    scenario: result.scenario,
    monthlyPensionNominal: result.monthlyPensionNominal,
    monthlyPensionRealToday: result.monthlyPensionRealToday,
    replacementRate: result.replacementRate,
    assumptions: result.assumptions,
    explainers: result.explainers,
  }, null, 2));
});
