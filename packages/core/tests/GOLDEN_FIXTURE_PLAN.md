# Golden Fixture Plan — Core Engine

## Purpose
This document defines the strategy, structure, and implementation approach for golden test fixtures. Golden fixtures serve as regression tests and validate the engine's structural correctness without relying on exact numeric values (until production data is available).

## Philosophy

### Structural vs. Numeric Testing

**Current Phase (Demo Providers)**:
- ✓ Structural validation: lengths, IDs, ordering, relationships
- ✓ Ratio checks: scenario B ≥ scenario A
- ✓ Symbolic IDs: `ANNUAL.Y2025`, `QTR.Q3.PREV`
- ✗ NO exact numeric values (demo providers use unrealistic multipliers)

**Future Phase (Production Providers)**:
- ✓ Numeric golden snapshots under version control
- ✓ Exact pension amount validation
- ✓ Versioned fixture directories: `fixtures/v2025-Q1/`

## Fixture Schema

### Input Schema

```typescript
interface FixtureInput {
  // Required fields
  birthYear: number;
  gender: 'M' | 'F';
  startWorkYear: number;
  currentGrossMonthly: number;
  
  // Optional fields
  retirementAge?: number;
  accumulatedInitialCapital?: number;
  subAccountBalance?: number;
  absenceFactor?: number;
  claimMonth?: number;
  anchorYear?: number;
}
```

### Structural Expectations Schema

```typescript
interface StructuralExpectations {
  // Trajectory validation
  trajectoryLength?: number;
  trajectoryMonotonic?: boolean;
  
  // Pension bounds (not exact values)
  minNominal?: number;
  maxNominal?: number;
  minReplacementRate?: number;
  maxReplacementRate?: number;
  
  // ID format validation
  annualIndexIdPattern?: RegExp;
  quarterlyIndexIdPattern?: RegExp;
  lifeTableIdPattern?: RegExp;
  
  // Finalization structure
  finalizationQuarterCount?: number;
  finalizationQuarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  
  // Explainer presence
  explainerContains?: string[];
  explainerMinLength?: number;
  
  // Comparative checks (for paired fixtures)
  compareTo?: {
    fixtureName: string;
    property: string;
    relation: 'GT' | 'LT' | 'GTE' | 'LTE' | 'EQ';
  };
}
```

### Numeric Golden Schema (Future)

```typescript
interface NumericGoldenExpectations {
  // Exact values (when production data available)
  monthlyPensionNominal: number;
  monthlyPensionRealToday: number;
  replacementRate: number;
  
  // Trajectory snapshots
  capitalTrajectory: Array<{
    year: number;
    cumulativeCapital: number;
  }>;
  
  // Version metadata
  dataVersion: string;  // e.g., "2025-Q1"
  providerKind: string; // e.g., "ZUS_PRODUCTION"
}
```

### Complete Fixture Schema

```typescript
interface GoldenFixture {
  // Metadata
  name: string;
  description: string;
  category: 'young' | 'midcareer' | 'near-retirement' | 'edge-case';
  tags: string[];
  
  // Input
  input: FixtureInput;
  
  // Structural expectations (always present)
  structural: StructuralExpectations;
  
  // Numeric golden (optional, future)
  numeric?: NumericGoldenExpectations;
}
```

## Fixture Categories

### 1. Baseline Scenarios

**young-worker.json**
```json
{
  "name": "Young Worker — Standard Path",
  "description": "Worker born 2000, started 2020, retiring at 65",
  "category": "young",
  "tags": ["baseline", "long-career", "standard"],
  "input": {
    "birthYear": 2000,
    "gender": "M",
    "startWorkYear": 2020,
    "currentGrossMonthly": 6000,
    "retirementAge": 65,
    "claimMonth": 6
  },
  "structural": {
    "trajectoryLength": 45,
    "trajectoryMonotonic": true,
    "minNominal": 1,
    "maxReplacementRate": 1.5,
    "annualIndexIdPattern": "^ANNUAL\\.Y\\d{4}$",
    "quarterlyIndexIdPattern": "^QTR\\.Q[1-4]\\.",
    "finalizationQuarter": "Q2",
    "explainerMinLength": 1
  }
}
```

**midcareer-worker.json**
```json
{
  "name": "Mid-Career Worker — Typical Tenure",
  "description": "Worker born 1980, started 2000, retiring at 60",
  "category": "midcareer",
  "tags": ["baseline", "female", "typical"],
  "input": {
    "birthYear": 1980,
    "gender": "F",
    "startWorkYear": 2000,
    "currentGrossMonthly": 8000,
    "retirementAge": 60,
    "absenceFactor": 0.95,
    "claimMonth": 6
  },
  "structural": {
    "trajectoryLength": 40,
    "trajectoryMonotonic": true,
    "minNominal": 1,
    "maxReplacementRate": 1.5,
    "finalizationQuarter": "Q2",
    "explainerMinLength": 1
  }
}
```

**near-retirement.json**
```json
{
  "name": "Near Retirement — With Initial Capital",
  "description": "Worker born 1960, initial capital from pre-1999 work",
  "category": "near-retirement",
  "tags": ["baseline", "initial-capital", "special-index"],
  "input": {
    "birthYear": 1960,
    "gender": "F",
    "startWorkYear": 1980,
    "currentGrossMonthly": 12000,
    "retirementAge": 60,
    "accumulatedInitialCapital": 200000,
    "absenceFactor": 0.9,
    "claimMonth": 6
  },
  "structural": {
    "trajectoryLength": 40,
    "minNominal": 1,
    "maxReplacementRate": 1.5,
    "explainerContains": ["Initial capital special index: applied"],
    "explainerMinLength": 1
  }
}
```

### 2. Edge Cases

**high-absence.json**
```json
{
  "name": "High Absence Factor — Sickness Impact",
  "description": "Worker with significant sickness absence (70% contribution)",
  "category": "edge-case",
  "tags": ["absence", "boundary"],
  "input": {
    "birthYear": 1990,
    "gender": "M",
    "startWorkYear": 2010,
    "currentGrossMonthly": 7000,
    "retirementAge": 65,
    "absenceFactor": 0.7,
    "claimMonth": 6
  },
  "structural": {
    "trajectoryLength": 55,
    "minNominal": 1,
    "maxReplacementRate": 1.5,
    "compareTo": {
      "fixtureName": "young-worker",
      "property": "monthlyPensionNominal",
      "relation": "LT"
    }
  }
}
```

**quarterly-Q1.json** through **quarterly-Q4.json**
```json
{
  "name": "Quarterly Mapping — Q1 (Jan-Mar)",
  "description": "Validates Q1 claim maps to Q3 of previous year",
  "category": "edge-case",
  "tags": ["quarterly", "mapping", "Q1"],
  "input": {
    "birthYear": 1980,
    "gender": "M",
    "startWorkYear": 2000,
    "currentGrossMonthly": 6000,
    "claimMonth": 2
  },
  "structural": {
    "finalizationQuarter": "Q1",
    "explainerContains": ["Quarterly: Q3 of previous year"]
  }
}
```

### 3. Comparative Pairs

Fixtures designed to test metamorphic properties:

**wage-comparison-base.json** & **wage-comparison-higher.json**
- Same scenario, different wages
- Validates: higher wage → higher pension

**absence-comparison-full.json** & **absence-comparison-reduced.json**
- Same scenario, different absence factors
- Validates: lower absence → higher pension

**retirement-age-60.json** & **retirement-age-65.json**
- Same scenario, different retirement ages
- Validates: later retirement → higher nominal pension

### 4. Provider-Specific Fixtures

**subaccount-optional.json**
```json
{
  "name": "Sub-Account — Optional Provider",
  "description": "Validates optional sub-account valorization",
  "category": "edge-case",
  "tags": ["subaccount", "optional-provider"],
  "input": {
    "birthYear": 1980,
    "gender": "M",
    "startWorkYear": 2000,
    "currentGrossMonthly": 8000,
    "subAccountBalance": 30000,
    "claimMonth": 6
  },
  "structural": {
    "explainerContains": ["Sub-account valorized"],
    "explainerMinLength": 1
  }
}
```

## Fixture Organization

### Directory Structure

```
packages/core/test/
├── fixtures/
│   ├── baseline/
│   │   ├── young-worker.json
│   │   ├── midcareer-worker.json
│   │   └── near-retirement.json
│   ├── edge-cases/
│   │   ├── high-absence.json
│   │   ├── quarterly-Q1.json
│   │   ├── quarterly-Q2.json
│   │   ├── quarterly-Q3.json
│   │   └── quarterly-Q4.json
│   ├── comparative/
│   │   ├── wage-comparison-base.json
│   │   ├── wage-comparison-higher.json
│   │   ├── absence-comparison-full.json
│   │   └── absence-comparison-reduced.json
│   ├── providers/
│   │   └── subaccount-optional.json
│   └── schema/
│       ├── fixture-schema.json
│       └── structural-schema.json
├── golden/  # Future: numeric golden snapshots
│   └── v2025-Q1/
│       └── [fixtures with numeric expectations]
└── engine.spec.ts
```

### Legacy Fixtures (To Be Migrated)

Current fixtures in `/test`:
- `fixtures.young.json` → migrate to `fixtures/baseline/young-worker.json`
- `fixtures.midcareer.json` → migrate to `fixtures/baseline/midcareer-worker.json`
- `fixtures.nearretirement.json` → migrate to `fixtures/baseline/near-retirement.json`
- `fixtures.absence.json` → migrate to `fixtures/edge-cases/high-absence.json`
- `fixtures.golden.json` → keep as placeholder for numeric golden

## Implementation Guide

### Fixture Loader Utility

```typescript
// test/utils/fixture-loader.ts

interface LoadedFixture {
  fixture: GoldenFixture;
  engineInput: EngineInput;
}

export function loadFixture(path: string): LoadedFixture {
  const fixture: GoldenFixture = JSON.parse(fs.readFileSync(path, 'utf-8'));
  
  // Map fixture input to EngineInput
  const engineInput: EngineInput = {
    birthYear: fixture.input.birthYear,
    gender: fixture.input.gender === 'M' ? 'M' : 'F',
    startWorkYear: fixture.input.startWorkYear,
    currentGrossMonthly: fixture.input.currentGrossMonthly,
    retirementAge: fixture.input.retirementAge,
    accumulatedInitialCapital: fixture.input.accumulatedInitialCapital,
    subAccountBalance: fixture.input.subAccountBalance,
    absenceFactor: fixture.input.absenceFactor,
    claimMonth: fixture.input.claimMonth,
    anchorYear: fixture.input.anchorYear,
  };
  
  return { fixture, engineInput };
}

export function loadAllFixtures(pattern: string): LoadedFixture[] {
  const files = glob.sync(pattern);
  return files.map(loadFixture);
}
```

### Structural Validator

```typescript
// test/utils/structural-validator.ts

export function validateStructural(
  output: EngineOutput,
  expected: StructuralExpectations
): void {
  if (expected.trajectoryLength !== undefined) {
    expect(output.capitalTrajectory.length).toBe(expected.trajectoryLength);
  }
  
  if (expected.trajectoryMonotonic) {
    const capitals = output.capitalTrajectory.map(t => t.cumulativeCapitalAfterAnnual);
    for (let i = 1; i < capitals.length; i++) {
      expect(capitals[i]).toBeGreaterThanOrEqual(capitals[i - 1]);
    }
  }
  
  if (expected.minNominal !== undefined) {
    expect(output.monthlyPensionNominal).toBeGreaterThanOrEqual(expected.minNominal);
  }
  
  if (expected.maxNominal !== undefined) {
    expect(output.monthlyPensionNominal).toBeLessThanOrEqual(expected.maxNominal);
  }
  
  if (expected.minReplacementRate !== undefined) {
    expect(output.replacementRate).toBeGreaterThanOrEqual(expected.minReplacementRate);
  }
  
  if (expected.maxReplacementRate !== undefined) {
    expect(output.replacementRate).toBeLessThanOrEqual(expected.maxReplacementRate);
  }
  
  if (expected.annualIndexIdPattern) {
    output.capitalTrajectory.forEach(t => {
      expect(t.annualValorizationIndex.toString()).toMatch(expected.annualIndexIdPattern!);
    });
  }
  
  if (expected.finalizationQuarter) {
    expect(output.finalization.quarterUsed).toBe(expected.finalizationQuarter);
  }
  
  if (expected.explainerContains) {
    expected.explainerContains.forEach(text => {
      expect(output.explainers.some(e => e.includes(text))).toBe(true);
    });
  }
  
  if (expected.explainerMinLength !== undefined) {
    expect(output.explainers.length).toBeGreaterThanOrEqual(expected.explainerMinLength);
  }
}
```

### Comparative Validator

```typescript
// test/utils/comparative-validator.ts

export function validateComparative(
  outputA: EngineOutput,
  outputB: EngineOutput,
  comparison: { property: string; relation: string }
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
  }
}
```

### Test Implementation Template

```typescript
// test/engine.spec.ts (UPDATED)

import { buildEngineWithDemoProviders } from '../src';
import { loadAllFixtures } from './utils/fixture-loader';
import { validateStructural } from './utils/structural-validator';
import { validateComparative } from './utils/comparative-validator';

describe('Pension Engine — Golden Fixtures', () => {
  const engine = buildEngineWithDemoProviders({ anchorYear: 2025 });
  
  describe('Baseline Scenarios', () => {
    const fixtures = loadAllFixtures('test/fixtures/baseline/*.json');
    
    fixtures.forEach(({ fixture, engineInput }) => {
      it(`${fixture.name}: ${fixture.description}`, () => {
        const output = engine(engineInput);
        validateStructural(output, fixture.structural);
      });
    });
  });
  
  describe('Edge Cases', () => {
    const fixtures = loadAllFixtures('test/fixtures/edge-cases/*.json');
    
    fixtures.forEach(({ fixture, engineInput }) => {
      it(`${fixture.name}: ${fixture.description}`, () => {
        const output = engine(engineInput);
        validateStructural(output, fixture.structural);
      });
    });
  });
  
  describe('Comparative Properties', () => {
    it('higher wage → higher pension', () => {
      const baseFixture = loadFixture('test/fixtures/comparative/wage-comparison-base.json');
      const higherFixture = loadFixture('test/fixtures/comparative/wage-comparison-higher.json');
      
      const outBase = engine(baseFixture.engineInput);
      const outHigher = engine(higherFixture.engineInput);
      
      expect(outHigher.monthlyPensionNominal).toBeGreaterThan(outBase.monthlyPensionNominal);
    });
  });
});
```

## Validation Rules

### ID Format Validation

```typescript
// Annual index IDs
expect(id).toMatch(/^ANNUAL\.Y\d{4}$/);
// Examples: ANNUAL.Y2025, ANNUAL.Y1999

// Quarterly index IDs
expect(id).toMatch(/^QTR\.Q[1-4]\.(PREV|CURR)/);
// Examples: QTR.Q3.PREV, QTR.Q1.CURR

// Life expectancy table IDs
expect(id).toMatch(/^SDZ\.\d{4}\.[MF]$/);
// Examples: SDZ.2025.M, SDZ.2030.F

// Provider kind
expect(kind).toMatch(/^(DEMO|ZUS_PRODUCTION)$/);
```

### Monotonicity Validation

```typescript
// Capital trajectory is non-decreasing
const capitals = output.capitalTrajectory.map(t => t.cumulativeCapitalAfterAnnual);
for (let i = 1; i < capitals.length; i++) {
  expect(capitals[i]).toBeGreaterThanOrEqual(capitals[i - 1]);
}

// Contributions are positive
output.capitalTrajectory.forEach(t => {
  expect(t.annualContribution).toBeGreaterThan(0);
});
```

### Relationship Validation

```typescript
// Real ≤ Nominal (under inflation)
expect(output.monthlyPensionRealToday).toBeLessThanOrEqual(output.monthlyPensionNominal);

// Replacement rate bounds
expect(output.replacementRate).toBeGreaterThanOrEqual(0);
expect(output.replacementRate).toBeLessThanOrEqual(1.5);
```

## Migration Strategy

### Phase 1: Structural-Only (Current)
1. Create fixture schema and templates
2. Migrate existing fixtures to new structure
3. Implement loader and validator utilities
4. Update test/engine.spec.ts to use new fixtures
5. Remove skipped tests once migration complete

### Phase 2: Numeric Golden (Future)
1. Wait for production provider implementation
2. Generate numeric baseline from production data
3. Create versioned fixture directory (e.g., `golden/v2025-Q1/`)
4. Add numeric validation alongside structural
5. Implement version-aware fixture loader

## Fixture Maintenance

### When to Update Fixtures

**Add new fixture when**:
- New scenario discovered in UAT
- New edge case identified
- Provider behavior changes
- Regression bug found

**Update existing fixture when**:
- Input schema changes
- New structural validation needed
- Comparative relationships change

**DO NOT update when**:
- Demo provider values change (structural only)
- Numeric values drift (wait for production data)

### Fixture Versioning

For numeric golden snapshots (future):

```
golden/
├── v2025-Q1/
│   └── young-worker.numeric.json
├── v2025-Q2/
│   └── young-worker.numeric.json
└── current -> v2025-Q2/
```

Version bump triggers:
- ZUS publishes new macro parameters
- Life expectancy tables updated
- Valorization indices revised

## References

- [TEST_BLUEPRINT.md](./TEST_BLUEPRINT.md) - Overall test strategy
- [GOLDEN_FIXTURE_PROTOCOL.md](./GOLDEN_FIXTURE_PROTOCOL.md) - Original protocol
- [SPEC_ENGINE.md](../SPEC_ENGINE.md) - Actuarial specification
- [TEST_PLAN_CORE.md](./TEST_PLAN_CORE.md) - High-level test plan

## Appendix: Complete Fixture Example

```json
{
  "name": "Complete Example — All Fields",
  "description": "Demonstrates all available fixture fields",
  "category": "edge-case",
  "tags": ["example", "complete", "documentation"],
  "input": {
    "birthYear": 1985,
    "gender": "F",
    "startWorkYear": 2005,
    "currentGrossMonthly": 9000,
    "retirementAge": 62,
    "accumulatedInitialCapital": 50000,
    "subAccountBalance": 20000,
    "absenceFactor": 0.92,
    "claimMonth": 8,
    "anchorYear": 2025
  },
  "structural": {
    "trajectoryLength": 42,
    "trajectoryMonotonic": true,
    "minNominal": 100,
    "maxNominal": 100000,
    "minReplacementRate": 0.1,
    "maxReplacementRate": 1.5,
    "annualIndexIdPattern": "^ANNUAL\\.Y\\d{4}$",
    "quarterlyIndexIdPattern": "^QTR\\.Q[1-4]\\.",
    "lifeTableIdPattern": "^SDZ\\.\\d{4}\\.F$",
    "finalizationQuarterCount": 2,
    "finalizationQuarter": "Q3",
    "explainerContains": [
      "Initial capital special index: applied",
      "Sub-account valorized",
      "Quarterly: Q1 of current year"
    ],
    "explainerMinLength": 3,
    "compareTo": {
      "fixtureName": "midcareer-worker",
      "property": "monthlyPensionNominal",
      "relation": "GT"
    }
  },
  "numeric": {
    "monthlyPensionNominal": 4567.89,
    "monthlyPensionRealToday": 3456.78,
    "replacementRate": 0.384,
    "capitalTrajectory": [
      { "year": 2005, "cumulativeCapital": 1234.56 },
      { "year": 2006, "cumulativeCapital": 2567.89 }
    ],
    "dataVersion": "2025-Q1",
    "providerKind": "ZUS_PRODUCTION"
  }
}
```
