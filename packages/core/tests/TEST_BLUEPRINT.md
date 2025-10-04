# Core Engine Test Blueprint

## Purpose
This document provides a comprehensive blueprint for testing the ZUS Pension Engine. It serves as a specification for test implementation, ensuring complete coverage of all actuarial rules, edge cases, and system invariants.

## Testing Strategy

### Test Categories

#### 1. Unit Tests
- **Scope**: Individual functions in isolation
- **Location**: `src/functions/__tests__/*.spec.ts`
- **Focus**: Pure logic, mathematical correctness, edge cases
- **Coverage Target**: 100% of function logic

#### 2. Integration Tests (E2E)
- **Scope**: Full pipeline from EngineInput to EngineOutput
- **Location**: `src/engine/__tests__/engine.e2e.spec.ts`
- **Focus**: Step orchestration, data flow, postconditions
- **Coverage Target**: All pipeline paths

#### 3. Property-Based Tests
- **Scope**: Mathematical invariants and metamorphic properties
- **Location**: `src/engine/__tests__/engine.properties.spec.ts`
- **Focus**: Monotonicity, sensitivity, determinism
- **Coverage Target**: All known invariants

#### 4. Golden Fixture Tests
- **Scope**: Known scenarios with expected structural outcomes
- **Location**: `test/engine.spec.ts` (data-driven)
- **Focus**: Regression prevention, structural validation
- **Coverage Target**: Representative scenarios

#### 5. Provider Tests
- **Scope**: Provider implementations (demo, production)
- **Location**: `src/providers-impl/*/tests/*.spec.ts`
- **Focus**: Contract compliance, determinism, ID formats
- **Coverage Target**: All provider methods

### Test Execution Strategy

```
1. Unit Tests (fast, isolated)
   ↓
2. Provider Tests (contract verification)
   ↓
3. Integration Tests (pipeline validation)
   ↓
4. Property Tests (invariants)
   ↓
5. Golden Fixture Tests (regression)
```

## Test Structure

### Unit Test Pattern

```typescript
describe('FunctionName', () => {
  describe('happy path', () => {
    it('should produce correct output for valid input', () => {
      // Arrange
      const input = { /* valid input */ };
      
      // Act
      const output = functionName(input);
      
      // Assert
      expect(output).toMatchObject({ /* expected structure */ });
    });
  });

  describe('edge cases', () => {
    it('should handle boundary values correctly', () => {
      // Test min/max values, zero, etc.
    });
  });

  describe('error cases', () => {
    it('should throw/return error for invalid input', () => {
      // Test validation, precondition failures
    });
  });

  describe('invariants', () => {
    it('should maintain mathematical properties', () => {
      // Test monotonicity, non-negativity, etc.
    });
  });
});
```

### Integration Test Pattern

```typescript
describe('Engine.calculate (integration)', () => {
  const engine = buildEngineWithDemoProviders();

  it('scenario: [description]', () => {
    const input: EngineInput = { /* scenario input */ };
    const output = engine(input);

    // Structural assertions
    expect(output.capitalTrajectory.length).toBe(expectedYears);
    expect(output.finalization.indicesApplied).toHaveLength(expectedQuarters);
    
    // Postconditions
    expect(output.monthlyPensionNominal).toBeGreaterThan(0);
    expect(output.assumptions.providerKind).toBe('DEMO');
    
    // Explainability
    expect(output.explainers.length).toBeGreaterThan(0);
  });
});
```

### Property Test Pattern

```typescript
describe('Engine.calculate (properties)', () => {
  it('property: wage increase → pension increase', () => {
    const baseInput = { /* base scenario */ };
    const increasedInput = { ...baseInput, currentGrossMonthly: baseInput.currentGrossMonthly * 1.1 };
    
    const outBase = engine(baseInput);
    const outIncreased = engine(increasedInput);
    
    expect(outIncreased.monthlyPensionNominal).toBeGreaterThanOrEqual(outBase.monthlyPensionNominal);
  });

  it('property: determinism (idempotence)', () => {
    const input = { /* any valid input */ };
    const out1 = engine(input);
    const out2 = engine(input);
    
    expect(out1).toEqual(out2);
  });
});
```

### Golden Fixture Test Pattern

```typescript
describe('Engine — Golden Fixtures', () => {
  const fixtures = loadFixtures('fixtures.*.json');

  fixtures.forEach((fixture) => {
    describe(`Scenario: ${fixture.name}`, () => {
      it('should satisfy structural expectations', () => {
        const input = mapFixtureInput(fixture.input);
        const output = engine(input);
        
        // Structural validation (no numeric comparison)
        if (fixture.expected.trajectoryLength) {
          expect(output.capitalTrajectory.length).toBe(fixture.expected.trajectoryLength);
        }
        
        if (fixture.expected.minNominal) {
          expect(output.monthlyPensionNominal).toBeGreaterThanOrEqual(fixture.expected.minNominal);
        }
        
        if (fixture.expected.maxReplacementRate) {
          expect(output.replacementRate).toBeLessThanOrEqual(fixture.expected.maxReplacementRate);
        }
        
        // ID format validation
        expect(output.assumptions.annualIndexSetId).toMatch(/^ANNUAL\./);
        expect(output.assumptions.quarterlyIndexSetId).toMatch(/^QUARTER\./);
      });
    });
  });
});
```

## Test Coverage Matrix

### Function-Level Coverage

| Function | Unit Tests | Integration | Properties | Golden Fixtures |
|----------|-----------|-------------|------------|-----------------|
| deriveEntitlement | ✓ | ✓ | ✓ (monotonicity) | ✓ |
| projectAnnualWageSeries | ✓ | ✓ | ✓ (geometric) | ✓ |
| computeAnnualContributions | ✓ | ✓ | ✓ (linearity) | ✓ |
| applyAnnualValorization | ✓ | ✓ | ✓ (compounding) | ✓ |
| valorizeInitialCapital | ✓ | ✓ | ✓ (special index) | ✓ |
| applyQuarterlyValorization | ✓ | ✓ | ✓ (mapping) | ✓ |
| composeBase | ✓ | ✓ | ✓ (aggregation) | ✓ |
| selectLifeExpectancy | ✓ | ✓ | ✓ (windowing) | ✓ |
| pensionCalcs | ✓ | ✓ | ✓ (division) | ✓ |
| buildOutput | ✓ | ✓ | ✓ (completeness) | ✓ |

### Scenario Coverage

| Scenario | Input Characteristics | Coverage Focus |
|----------|----------------------|----------------|
| Young worker | birthYear: 2000, long career | Wage growth, long trajectory |
| Mid-career | birthYear: 1980, moderate tenure | Standard path, typical absence |
| Near retirement | birthYear: 1960, initial capital | Initial capital, special index |
| High absence | absenceFactor: 0.7 | Contribution reduction |
| Quarterly boundaries | claimMonth: 1-12 | All quarter mappings |
| Female/SDŻ | gender: F | Life expectancy windowing |
| Initial capital | accumulatedInitialCapital > 0 | Special index application |
| Sub-account | subAccountBalance > 0 | Optional provider |

## Invariants to Test

### Mathematical Invariants

1. **Non-negativity**: All monetary values ≥ 0
2. **Monotonicity**: 
   - Higher wage → higher pension
   - Lower absence → higher pension
   - Later retirement → higher pension
3. **Consistency**:
   - Trajectory length = retirementYear - startWorkYear
   - Real pension ≤ Nominal pension (under inflation)
4. **Bounds**:
   - Replacement rate: 0 ≤ rate ≤ 1.5
   - Absence factor: 0 < factor ≤ 1
5. **Determinism**: Same input → same output

### Structural Invariants

1. **IDs Present**: All provider IDs populated in assumptions
2. **Explainers**: Non-empty, relevant messages
3. **Trajectory**: Ordered, complete, no gaps
4. **Finalization**: Correct quarter mapping, non-empty indices

## Error Case Coverage

### Validation Errors

- Missing required fields (birthYear, gender, etc.)
- Out-of-range values (retirementAge < minimum)
- Invalid enums (gender not M/F)
- Negative monetary values

### Provider Errors

- Missing annual index for year
- Missing quarterly index for quarter
- Life expectancy table not found
- Macro projection out of range

### Business Logic Errors

- Retirement before start of work
- Initial capital applied twice
- Invalid quarter mapping
- Division by zero (life expectancy = 0)

## Acceptance Criteria

A test suite is complete when:

1. ✓ All functions from SPEC_ENGINE.md have unit tests
2. ✓ All pipeline steps covered in integration tests
3. ✓ All invariants validated in property tests
4. ✓ All scenarios represented in golden fixtures
5. ✓ All error states produce error envelopes (not crashes)
6. ✓ All provider contracts tested
7. ✓ 100% code coverage in critical paths
8. ✓ Determinism verified across all test types

## Test Data Strategy

### Demo Providers
- Use `buildEngineWithDemoProviders()` for tests
- Demo data: predictable, monotonic, unrealistic multipliers OK
- Focus: structural correctness, not numeric accuracy

### Production Providers (Future)
- Will use real ZUS tables from `/data/*.xlsx`
- Numeric golden snapshots will be versioned
- See GOLDEN_FIXTURE_PLAN.md for numeric testing strategy

## Traceability Matrix

| SPEC_ENGINE.md Section | Test Cases | Files |
|------------------------|------------|-------|
| A. Entitlement setup | CORE-ENT-001..004 | derive-entitlement.spec.ts |
| B. Wage projection | CORE-WAGE-001..003 | project-wage.spec.ts |
| C. Annual contributions | CORE-CONTRIB-001..005 | annual-contributions.spec.ts |
| D. Annual valorization | CORE-ANNUAL-001..004 | annual-valorization.spec.ts |
| E. Quarterly valorization | CORE-QUARTER-001..005 | quarterly-valorization.spec.ts |
| F. Initial capital | CORE-INITCAP-001..004 | initial-capital.spec.ts |
| G. Sub-account | CORE-SUBACC-001..002 | subaccount.spec.ts |
| H. Base and pension | CORE-PENSION-001..004 | pension-calcs.spec.ts |
| I. Explainability | CORE-EXPL-001..003 | build-output.spec.ts |

## Implementation Checklist

### Phase 1: Unit Tests (Priority: P0)
- [ ] deriveEntitlement.spec.ts
- [ ] project-wage.spec.ts
- [ ] annual-contributions.spec.ts
- [ ] annual-valorization.spec.ts
- [ ] quarterly-valorization.spec.ts
- [ ] initial-capital.spec.ts
- [ ] life-expectancy.spec.ts
- [ ] pension-calcs.spec.ts
- [ ] build-output.spec.ts

### Phase 2: Integration Tests (Priority: P0)
- [x] engine.e2e.spec.ts (basic coverage exists)
- [ ] Expand with all scenarios from TEST_CASES_*.md

### Phase 3: Property Tests (Priority: P1)
- [x] engine.properties.spec.ts (basic coverage exists)
- [ ] Add all metamorphic properties

### Phase 4: Golden Fixtures (Priority: P1)
- [ ] Migrate test/engine.spec.ts to new API
- [ ] Create fixture loader utility
- [ ] Implement structural validation suite

### Phase 5: Error Testing (Priority: P2)
- [ ] Validation error tests
- [ ] Provider error tests
- [ ] Business logic error tests

## References

- [SPEC_ENGINE.md](../SPEC_ENGINE.md) - Actuarial algorithm specification
- [GOLDEN_FIXTURE_PLAN.md](./GOLDEN_FIXTURE_PLAN.md) - Golden fixture strategy
- [TEST_PLAN_CORE.md](./TEST_PLAN_CORE.md) - High-level test strategy
- [TEST_MATRIX_FUNCTIONS.md](./TEST_MATRIX_FUNCTIONS.md) - Function test matrix
- [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md) - Test case naming
