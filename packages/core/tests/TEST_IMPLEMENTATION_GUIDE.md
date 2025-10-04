# Test Implementation Guide — Core Engine

## Purpose
This guide provides step-by-step instructions for implementing tests for the ZUS Pension Engine. It serves as a practical companion to the [TEST_BLUEPRINT.md](./TEST_BLUEPRINT.md) specification.

## Quick Start

### Prerequisites
```bash
cd packages/core
pnpm install
pnpm build
```

### Run Tests
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- derive-entitlement.spec.ts

# Run with coverage
pnpm test -- --coverage

# Run in watch mode
pnpm test -- --watch
```

## Implementation Workflow

### Step 1: Choose Test Type

| Test Type | When to Use | Location |
|-----------|------------|----------|
| **Unit Test** | Testing individual function logic | `src/functions/__tests__/` |
| **Integration Test** | Testing full pipeline | `src/engine/__tests__/engine.e2e.spec.ts` |
| **Property Test** | Testing invariants | `src/engine/__tests__/engine.properties.spec.ts` |
| **Golden Fixture** | Testing known scenarios | `test/engine.spec.ts` |
| **Provider Test** | Testing provider implementation | `src/providers-impl/*/tests/` |

### Step 2: Create Test File

**Template for Unit Test:**
```typescript
// src/functions/__tests__/[function-name].spec.ts

import { functionName } from '../function-name';
import { makeDemoProviderBundle } from '../../providers-impl/demo/demo-bundle';

describe('functionName', () => {
  const providers = makeDemoProviderBundle();

  describe('happy path', () => {
    it('should produce correct output for typical input', () => {
      // Arrange
      const input = {
        // ... valid input
      };

      // Act
      const result = functionName(input, providers);

      // Assert
      expect(result).toMatchObject({
        // ... expected structure
      });
    });
  });

  describe('edge cases', () => {
    it('should handle minimum values', () => {
      // Test boundary conditions
    });

    it('should handle maximum values', () => {
      // Test boundary conditions
    });
  });

  describe('error cases', () => {
    it('should throw error for invalid input', () => {
      expect(() => {
        functionName(invalidInput, providers);
      }).toThrow();
    });
  });

  describe('invariants', () => {
    it('should maintain non-negativity', () => {
      // Test mathematical properties
    });
  });
});
```

**Template for Integration Test:**
```typescript
// Add to src/engine/__tests__/engine.e2e.spec.ts

it('scenario: [description]', () => {
  const input: EngineInput = {
    birthYear: 1990,
    gender: 'M',
    startWorkYear: 2010,
    currentGrossMonthly: 6000,
    claimMonth: 6,
  };

  const output = demoEngine(input);

  // Postconditions
  expect(output.monthlyPensionNominal).toBeGreaterThan(0);
  expect(output.monthlyPensionRealToday).toBeGreaterThan(0);
  expect(output.replacementRate).toBeGreaterThanOrEqual(0);
  expect(output.replacementRate).toBeLessThanOrEqual(1.5);

  // Structural assertions
  expect(output.capitalTrajectory.length).toBe(
    output.scenario.retirementYear - input.startWorkYear
  );
  expect(output.finalization.indicesApplied.length).toBeGreaterThan(0);

  // Explainability
  expect(output.explainers.length).toBeGreaterThan(0);
  expect(output.assumptions.providerKind).toBe('DEMO');
});
```

### Step 3: Write Assertions

#### Common Assertion Patterns

**Non-negativity:**
```typescript
expect(value).toBeGreaterThanOrEqual(0);
```

**Bounds checking:**
```typescript
expect(output.replacementRate).toBeGreaterThanOrEqual(0);
expect(output.replacementRate).toBeLessThanOrEqual(1.5);
```

**Monotonicity:**
```typescript
const values = trajectory.map(t => t.cumulativeCapital);
for (let i = 1; i < values.length; i++) {
  expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
}
```

**Structure validation:**
```typescript
expect(output.capitalTrajectory).toHaveLength(expectedLength);
expect(output.assumptions.annualIndexSetId).toMatch(/^ANNUAL\./);
```

**Comparative assertions:**
```typescript
const outBase = engine(baseInput);
const outHigher = engine({ ...baseInput, currentGrossMonthly: baseInput.currentGrossMonthly * 1.1 });
expect(outHigher.monthlyPensionNominal).toBeGreaterThan(outBase.monthlyPensionNominal);
```

**Explainer validation:**
```typescript
expect(output.explainers.some(e => e.includes('expected text'))).toBe(true);
expect(output.explainers.length).toBeGreaterThan(0);
```

### Step 4: Handle Providers

#### Using Demo Providers
```typescript
import { buildEngineWithDemoProviders } from '../engine';

const demoEngine = buildEngineWithDemoProviders({ anchorYear: 2025 });
```

#### Using Provider Bundle Directly
```typescript
import { Engine } from '../engine';
import { makeDemoProviderBundle } from '../../providers-impl/demo/demo-bundle';

const providers = makeDemoProviderBundle();
const output = Engine.calculate(input, providers);
```

#### Accessing Provider Components
```typescript
const providers = makeDemoProviderBundle();

// Annual valorization
const annualIndex = providers.annual.getAnnualIndex(2025);
expect(annualIndex.id).toBe('ANNUAL.Y2025');

// Quarterly valorization
const quarterIndex = providers.quarterly.getQuarterIndex(2025, 'Q2');
expect(quarterIndex.id).toMatch(/^QTR\.Q2\./);

// Life expectancy
const life = providers.life.getLifeExpectancyYears('M', { year: 2025, month: 6 });
expect(life.years).toBeGreaterThan(0);

// Contribution rate
const contribRate = providers.contrib.getContributionRate();
expect(contribRate.rate).toBeCloseTo(0.1952);
```

## Test Case Catalog

### CORE-ENT-001: Entitlement — Default Retirement Age
```typescript
it('CORE-ENT-001: should use default retirement age when not provided', () => {
  const inputMale: EngineInput = {
    birthYear: 1990,
    gender: 'M',
    startWorkYear: 2010,
    currentGrossMonthly: 6000,
    claimMonth: 6,
  };

  const outputMale = demoEngine(inputMale);
  expect(outputMale.scenario.retirementAge).toBe(65);

  const inputFemale: EngineInput = {
    ...inputMale,
    gender: 'F',
  };

  const outputFemale = demoEngine(inputFemale);
  expect(outputFemale.scenario.retirementAge).toBe(60);
});
```

### CORE-QUARTER-001: Quarterly — Q1 Mapping
```typescript
it('CORE-QUARTER-001: Q1 claim should map to Q3 of previous year', () => {
  const input: EngineInput = {
    birthYear: 1980,
    gender: 'M',
    startWorkYear: 2000,
    currentGrossMonthly: 6000,
    claimMonth: 2, // Q1
  };

  const output = demoEngine(input);
  expect(output.finalization.quarterUsed).toBe('Q1');
  // Verify index ID contains reference to Q3 PREV
  expect(output.finalization.indicesApplied[0]).toMatch(/Q3.*PREV/);
});
```

### CORE-ANNUAL-001: Annual Valorization — Monotonicity
```typescript
it('CORE-ANNUAL-001: capital should be non-decreasing after annual valorization', () => {
  const input: EngineInput = {
    birthYear: 1990,
    gender: 'M',
    startWorkYear: 2010,
    currentGrossMonthly: 6000,
    claimMonth: 6,
  };

  const output = demoEngine(input);
  const capitals = output.capitalTrajectory.map(t => t.cumulativeCapitalAfterAnnual);

  for (let i = 1; i < capitals.length; i++) {
    expect(capitals[i]).toBeGreaterThanOrEqual(capitals[i - 1]);
  }
});
```

### CORE-INITCAP-001: Initial Capital — Special Index
```typescript
it('CORE-INITCAP-001: should apply 1999 special index to initial capital', () => {
  const input: EngineInput = {
    birthYear: 1970,
    gender: 'M',
    startWorkYear: 1990,
    currentGrossMonthly: 8000,
    accumulatedInitialCapital: 50000,
    claimMonth: 6,
  };

  const output = demoEngine(input);
  expect(
    output.explainers.some(e => e.includes('Initial capital special index: applied'))
  ).toBe(true);
});
```

### CORE-SDZ-001: Life Expectancy — Window Logic
```typescript
it('CORE-SDZ-001: April-March window uses same life table', () => {
  const providers = makeDemoProviderBundle();

  const april = providers.life.getLifeExpectancyYears('F', { year: 2030, month: 4 });
  const march = providers.life.getLifeExpectancyYears('F', { year: 2031, month: 3 });

  expect(april.id).toBe(march.id);
});
```

### CORE-CPI-001: Real Pension — Inflation Discount
```typescript
it('CORE-CPI-001: real pension should be ≤ nominal under inflation', () => {
  const input: EngineInput = {
    birthYear: 1990,
    gender: 'M',
    startWorkYear: 2010,
    currentGrossMonthly: 6000,
    claimMonth: 6,
  };

  const output = demoEngine(input);
  expect(output.monthlyPensionRealToday).toBeLessThanOrEqual(output.monthlyPensionNominal);
});
```

### CORE-ABS-001: Absence Factor — Contribution Reduction
```typescript
it('CORE-ABS-001: lower absence factor should reduce pension', () => {
  const inputFull: EngineInput = {
    birthYear: 1990,
    gender: 'M',
    startWorkYear: 2010,
    currentGrossMonthly: 6000,
    absenceFactor: 1.0,
    claimMonth: 6,
  };

  const inputReduced: EngineInput = {
    ...inputFull,
    absenceFactor: 0.7,
  };

  const outFull = demoEngine(inputFull);
  const outReduced = demoEngine(inputReduced);

  expect(outReduced.monthlyPensionNominal).toBeLessThan(outFull.monthlyPensionNominal);
});
```

### CORE-REP-001: Replacement Rate — Bounds
```typescript
it('CORE-REP-001: replacement rate should be between 0 and 1.5', () => {
  const input: EngineInput = {
    birthYear: 1990,
    gender: 'M',
    startWorkYear: 2010,
    currentGrossMonthly: 6000,
    claimMonth: 6,
  };

  const output = demoEngine(input);
  expect(output.replacementRate).toBeGreaterThanOrEqual(0);
  expect(output.replacementRate).toBeLessThanOrEqual(1.5);
});
```

### CORE-ERR-001: Validation Error — Missing Fields
```typescript
it('CORE-ERR-001: should reject input with missing required fields', () => {
  const invalidInput = {
    birthYear: 1990,
    // gender missing
    startWorkYear: 2010,
    currentGrossMonthly: 6000,
  } as any;

  expect(() => {
    demoEngine(invalidInput);
  }).toThrow();
});
```

## Debugging Test Failures

### Common Issues

**Issue: Demo provider values unrealistic**
- **Symptom**: Replacement rate > 1000
- **Solution**: Use structural assertions only (lengths, IDs, ordering)
- **Avoid**: Exact numeric comparisons with demo data

**Issue: Trajectory length mismatch**
- **Symptom**: `Expected 45, received 44`
- **Check**: Retirement year calculation, off-by-one errors
- **Formula**: `length = retirementYear - startWorkYear`

**Issue: Quarterly mapping incorrect**
- **Symptom**: Wrong quarter index ID
- **Check**: Claim month → quarter mapping
- **Mapping**: Q1(1-3)→Q3 prev, Q2(4-6)→Q4 prev, Q3(7-9)→Q1 curr, Q4(10-12)→Q2 curr

**Issue: Life expectancy window incorrect**
- **Symptom**: Different table for adjacent months
- **Check**: April-March window logic
- **Rule**: Apr(year N) through Mar(year N+1) use same table

### Debugging Techniques

**1. Inspect engine output:**
```typescript
const output = demoEngine(input);
console.log(JSON.stringify(output, null, 2));
```

**2. Check trajectory:**
```typescript
output.capitalTrajectory.forEach(t => {
  console.log(`Year ${t.year}: ${t.cumulativeCapitalAfterAnnual}`);
});
```

**3. Review explainers:**
```typescript
output.explainers.forEach(e => {
  console.log(e);
});
```

**4. Validate provider IDs:**
```typescript
console.log('Annual set:', output.assumptions.annualIndexSetId);
console.log('Quarterly set:', output.assumptions.quarterlyIndexSetId);
console.log('Life table:', output.assumptions.lifeTableId);
```

## Testing Checklist

Before submitting a test:

- [ ] Test follows naming convention (CORE-XXX-###)
- [ ] Test has descriptive "should..." statement
- [ ] Happy path covered
- [ ] Edge cases identified and tested
- [ ] Error cases validated
- [ ] Invariants checked
- [ ] No hardcoded values (use providers)
- [ ] Assertions are structural (not numeric for demo)
- [ ] Test is deterministic (same input → same output)
- [ ] Test is isolated (no dependencies on other tests)

## Migration Guide

### Migrating Legacy Tests

**Current (LEGACY):**
```typescript
it.skip('should match golden snapshot when updated', () => {
  // TODO: Implement golden test with new API
  expect(true).toBe(true);
});
```

**New (UPDATED):**
```typescript
import { loadFixture } from './utils/fixture-loader';
import { validateStructural } from './utils/structural-validator';

it('young worker baseline scenario', () => {
  const { fixture, engineInput } = loadFixture('test/fixtures/baseline/young-worker.json');
  const output = demoEngine(engineInput);
  validateStructural(output, fixture.structural);
});
```

### Converting Old Fixtures

**Old format:**
```json
{
  "input": {
    "birthYear": 2000,
    "gender": "male",
    "salary": 6000
  },
  "expected": {
    "minNominal": 1,
    "trajectoryLength": 45
  }
}
```

**New format:**
```json
{
  "name": "Young Worker — Standard Path",
  "category": "baseline",
  "tags": ["young", "standard"],
  "input": {
    "birthYear": 2000,
    "gender": "M",
    "currentGrossMonthly": 6000,
    "startWorkYear": 2020,
    "claimMonth": 6
  },
  "structural": {
    "trajectoryLength": 45,
    "minNominal": 1,
    "maxReplacementRate": 1.5
  }
}
```

## Advanced Topics

### Custom Matchers

```typescript
// test/matchers/structural-matchers.ts

expect.extend({
  toBeMonotonic(received: number[]) {
    for (let i = 1; i < received.length; i++) {
      if (received[i] < received[i - 1]) {
        return {
          pass: false,
          message: () => `Expected array to be monotonic, but ${received[i]} < ${received[i - 1]} at index ${i}`
        };
      }
    }
    return { pass: true, message: () => '' };
  },

  toHaveValidProviderIds(received: EngineOutput) {
    const checks = [
      received.assumptions.annualIndexSetId.match(/^ANNUAL\./),
      received.assumptions.quarterlyIndexSetId.match(/^QUARTER\./),
      received.assumptions.lifeTableId.match(/^SDZ\./),
    ];

    const pass = checks.every(Boolean);
    return {
      pass,
      message: () => pass ? '' : 'Provider IDs have invalid format'
    };
  }
});
```

**Usage:**
```typescript
const capitals = output.capitalTrajectory.map(t => t.cumulativeCapital);
expect(capitals).toBeMonotonic();
expect(output).toHaveValidProviderIds();
```

### Parameterized Tests

```typescript
describe.each([
  [1, 'Q1', /Q3.*PREV/],
  [4, 'Q2', /Q4.*PREV/],
  [7, 'Q3', /Q1.*CURR/],
  [10, 'Q4', /Q2.*CURR/],
])('quarterly mapping for month %i', (claimMonth, expectedQuarter, indexPattern) => {
  it(`should map to ${expectedQuarter}`, () => {
    const input: EngineInput = {
      birthYear: 1980,
      gender: 'M',
      startWorkYear: 2000,
      currentGrossMonthly: 6000,
      claimMonth,
    };

    const output = demoEngine(input);
    expect(output.finalization.quarterUsed).toBe(expectedQuarter);
    expect(output.finalization.indicesApplied[0]).toMatch(indexPattern);
  });
});
```

## Resources

- [TEST_BLUEPRINT.md](./TEST_BLUEPRINT.md) - Test strategy and architecture
- [GOLDEN_FIXTURE_PLAN.md](./GOLDEN_FIXTURE_PLAN.md) - Fixture structure and implementation
- [SPEC_ENGINE.md](../SPEC_ENGINE.md) - Actuarial algorithm specification
- [Jest Documentation](https://jestjs.io/docs/getting-started) - Testing framework
- [TypeScript Testing Guide](https://www.typescriptlang.org/docs/handbook/testing.html)

## Support

For questions or issues:
1. Check existing tests in `src/engine/__tests__/` for examples
2. Review test case documentation in `tests/TEST_CASES_*.md`
3. Consult [ARCHITECTURE.md](../ARCHITECTURE.md) for system design
4. Open an issue with tag `area:testing`
