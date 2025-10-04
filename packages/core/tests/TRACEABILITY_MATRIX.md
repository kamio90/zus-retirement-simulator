# Traceability Matrix — SPEC_ENGINE.md to Test Cases

## Purpose
This document maps every requirement in [SPEC_ENGINE.md](../SPEC_ENGINE.md) to corresponding test cases, ensuring complete coverage and traceability from specification to implementation.

## Matrix Format

| Spec Ref | Requirement | Test Case ID | Test File | Status |
|----------|-------------|--------------|-----------|--------|

## A. Entitlement Setup

| Spec Ref | Requirement | Test Case ID | Test File | Status |
|----------|-------------|--------------|-----------|--------|
| A.1 | Compute retirementAge (default by gender if not provided) | CORE-ENT-001 | derive-entitlement.spec.ts | ✓ Exists |
| A.2 | Compute entitlementYear and claimDate (year + month) | CORE-ENT-002 | derive-entitlement.spec.ts | ✓ Exists |
| A.3 | Map EntitlementQuarter from claimMonth (Q1/Q2/Q3/Q4) | CORE-QUARTER-001..004 | quarterly-valorization.spec.ts | ✓ Exists |
| A.4 | Default retirement age: Male=65, Female=60 | CORE-ENT-001 | engine.e2e.spec.ts | ✓ Exists |
| A.5 | Claim month validation (1-12) | CORE-ERR-002 | validation.spec.ts | ⚠️ Needed |
| A.6 | Retirement age bounds (min 60, max 70) | CORE-ERR-003 | validation.spec.ts | ⚠️ Needed |

## B. Wage Projection

| Spec Ref | Requirement | Test Case ID | Test File | Status |
|----------|-------------|--------------|-----------|--------|
| B.1 | AnchorYear = simulation calendar year (default 2025) | CORE-WAGE-001 | wage-projection.spec.ts | ⚠️ Needed |
| B.2 | Option A: backcast current gross to startWorkYear, forecast forward | CORE-WAGE-002 | wage-projection.spec.ts | ⚠️ Needed |
| B.3 | Option B: forward-only from anchor | CORE-WAGE-003 | wage-projection.spec.ts | ⚠️ Needed |
| B.4 | Yield annual wage in nominal PLN for each year | CORE-WAGE-004 | engine.e2e.spec.ts | ✓ Exists |
| B.5 | Wage series chronological order | CORE-WAGE-005 | wage-projection.spec.ts | ⚠️ Needed |
| B.6 | Wage series non-negative | CORE-WAGE-006 | engine.properties.spec.ts | ✓ Exists |

## C. Annual Contributions

| Spec Ref | Requirement | Test Case ID | Test File | Status |
|----------|-------------|--------------|-----------|--------|
| C.1 | Contribution = annual wage × contribution rate × absenceFactor | CORE-CONTRIB-001 | annual-contributions.spec.ts | ⚠️ Needed |
| C.2 | Contribution rate injected by provider (19.52%) | CORE-CONTRIB-002 | demo-providers.spec.ts | ✓ Exists |
| C.3 | Absence factor bounds (0 < factor ≤ 1) | CORE-ABS-001 | validation.spec.ts | ⚠️ Needed |
| C.4 | Default absence factor = 1.0 | CORE-ABS-002 | engine.e2e.spec.ts | ✓ Exists |
| C.5 | Absence factor reduces contributions proportionally | CORE-ABS-003 | engine.properties.spec.ts | ✓ Exists |

## D. Annual Valorization

| Spec Ref | Requirement | Test Case ID | Test File | Status |
|----------|-------------|--------------|-----------|--------|
| D.1 | Contributions by 31 Jan valorized on 1 June using index for Y-1 | CORE-ANNUAL-001 | annual-valorization.spec.ts | ⚠️ Needed |
| D.2 | Cumulative valorization in order | CORE-ANNUAL-002 | annual-valorization.spec.ts | ⚠️ Needed |
| D.3 | Annual index ID format: ANNUAL.Y{year} | CORE-ANNUAL-003 | demo-providers.spec.ts | ✓ Exists |
| D.4 | Capital monotonically increasing | CORE-ANNUAL-004 | engine.properties.spec.ts | ✓ Exists |
| D.5 | Missing index error handling | CORE-ERR-004 | error-handling.spec.ts | ⚠️ Needed |

## E. Quarterly Valorization

| Spec Ref | Requirement | Test Case ID | Test File | Status |
|----------|-------------|--------------|-----------|--------|
| E.1 | Contributions after last 31 Jan: apply quarterly up to claim month | CORE-QUARTER-001 | quarterly-valorization.spec.ts | ⚠️ Needed |
| E.2 | Q1 (Jan-Mar) claim → Q3 of previous year | CORE-QUARTER-002 | engine.e2e.spec.ts | ✓ Exists |
| E.3 | Q2 (Apr-Jun) claim → Q4 of previous year | CORE-QUARTER-003 | engine.e2e.spec.ts | ✓ Exists |
| E.4 | Q3 (Jul-Sep) claim → Q1 of current year | CORE-QUARTER-004 | engine.e2e.spec.ts | ✓ Exists |
| E.5 | Q4 (Oct-Dec) claim → Q2 of current year | CORE-QUARTER-005 | engine.e2e.spec.ts | ✓ Exists |
| E.6 | Valorize on last day of first month of quarter | CORE-QUARTER-006 | quarterly-valorization.spec.ts | ⚠️ Needed |
| E.7 | Compounding indices in correct order | CORE-QUARTER-007 | quarterly-valorization.spec.ts | ⚠️ Needed |
| E.8 | Quarterly index ID format: QTR.Q{n}.{PREV\|CURR} | CORE-QUARTER-008 | demo-providers.spec.ts | ✓ Exists |

## F. Initial Capital

| Spec Ref | Requirement | Test Case ID | Test File | Status |
|----------|-------------|--------------|-----------|--------|
| F.1 | If provided: valorize using special 1999 index (1 June 2000) | CORE-INITCAP-001 | initial-capital.spec.ts | ⚠️ Needed |
| F.2 | Special 1999 index applied first, then annual path | CORE-INITCAP-002 | engine.e2e.spec.ts | ✓ Exists |
| F.3 | Quarterly rules apply at entitlement | CORE-INITCAP-003 | initial-capital.spec.ts | ⚠️ Needed |
| F.4 | Explainer for special index application | CORE-INITCAP-004 | engine.e2e.spec.ts | ✓ Exists |
| F.5 | No initial capital: skip special index | CORE-INITCAP-005 | engine.e2e.spec.ts | ✓ Exists |
| F.6 | Error if special index missing | CORE-ERR-005 | error-handling.spec.ts | ⚠️ Needed |

## G. Sub-Account (Optional)

| Spec Ref | Requirement | Test Case ID | Test File | Status |
|----------|-------------|--------------|-----------|--------|
| G.1 | Valorize per provider path if present | CORE-SUBACC-001 | subaccount.spec.ts | ⚠️ Needed |
| G.2 | Sub-account provider is optional | CORE-SUBACC-002 | demo-providers.spec.ts | ✓ Exists |
| G.3 | Sub-account ID format: SUBACC.{year} | CORE-SUBACC-003 | demo-providers.spec.ts | ✓ Exists |
| G.4 | Explainer when sub-account valorized | CORE-SUBACC-004 | subaccount.spec.ts | ⚠️ Needed |

## H. Base and Pension

| Spec Ref | Requirement | Test Case ID | Test File | Status |
|----------|-------------|--------------|-----------|--------|
| H.1 | Base = sum of valorized contributions + initial capital (+ sub-account) | CORE-PENSION-001 | pension-calcs.spec.ts | ⚠️ Needed |
| H.2 | SDŻ (life expectancy) from provider, claim date window (Apr–Mar) | CORE-SDZ-001 | life-expectancy.spec.ts | ⚠️ Needed |
| H.3 | Monthly pension nominal = base / (SDŻ_years × 12) | CORE-PENSION-002 | pension-calcs.spec.ts | ⚠️ Needed |
| H.4 | Monthly pension real = nominal discounted by cumulative CPI | CORE-CPI-001 | pension-calcs.spec.ts | ⚠️ Needed |
| H.5 | Replacement rate = real monthly pension / current gross monthly | CORE-REP-001 | pension-calcs.spec.ts | ⚠️ Needed |
| H.6 | SDŻ table ID format: SDZ.{year}.{M\|F} | CORE-SDZ-002 | demo-providers.spec.ts | ✓ Exists |
| H.7 | Life expectancy windowing: Apr(N) through Mar(N+1) same table | CORE-SDZ-003 | demo-providers.spec.ts | ✓ Exists |
| H.8 | Real ≤ Nominal under inflation | CORE-CPI-002 | engine.properties.spec.ts | ✓ Exists |
| H.9 | Replacement rate bounds (0 ≤ rate ≤ 1.5) | CORE-REP-002 | engine.properties.spec.ts | ✓ Exists |

## I. Explainability

| Spec Ref | Requirement | Test Case ID | Test File | Status |
|----------|-------------|--------------|-----------|--------|
| I.1 | Build capital trajectory per year | CORE-EXPL-001 | build-output.spec.ts | ⚠️ Needed |
| I.2 | Record final quarterly step | CORE-EXPL-002 | build-output.spec.ts | ⚠️ Needed |
| I.3 | Emit assumptions (index IDs, SDŻ table ID, provider kind) | CORE-EXPL-003 | engine.e2e.spec.ts | ✓ Exists |
| I.4 | Emit explainers (human-readable messages) | CORE-EXPL-004 | engine.e2e.spec.ts | ✓ Exists |
| I.5 | Trajectory length = retirementYear - startWorkYear | CORE-EXPL-005 | engine.e2e.spec.ts | ✓ Exists |
| I.6 | Finalization indices non-empty | CORE-EXPL-006 | engine.e2e.spec.ts | ✓ Exists |

## Cross-Cutting Concerns

### Determinism

| Spec Ref | Requirement | Test Case ID | Test File | Status |
|----------|-------------|--------------|-----------|--------|
| CC.1 | Same input → same output (idempotence) | CORE-DET-001 | engine.properties.spec.ts | ✓ Exists |
| CC.2 | No randomness in calculations | CORE-DET-002 | engine.e2e.spec.ts | ✓ Exists |
| CC.3 | Provider results deterministic | CORE-DET-003 | demo-providers.spec.ts | ✓ Exists |

### Error Handling

| Spec Ref | Requirement | Test Case ID | Test File | Status |
|----------|-------------|--------------|-----------|--------|
| CC.4 | Missing required field → error | CORE-ERR-001 | validation.spec.ts | ⚠️ Needed |
| CC.5 | Out-of-range value → error | CORE-ERR-002 | validation.spec.ts | ⚠️ Needed |
| CC.6 | Invalid enum value → error | CORE-ERR-003 | validation.spec.ts | ⚠️ Needed |
| CC.7 | Missing provider data → error | CORE-ERR-004 | error-handling.spec.ts | ⚠️ Needed |
| CC.8 | Division by zero → error | CORE-ERR-005 | error-handling.spec.ts | ⚠️ Needed |

### Invariants

| Spec Ref | Requirement | Test Case ID | Test File | Status |
|----------|-------------|--------------|-----------|--------|
| CC.9 | All monetary values ≥ 0 | CORE-INV-001 | engine.properties.spec.ts | ✓ Exists |
| CC.10 | Higher wage → higher pension | CORE-INV-002 | engine.properties.spec.ts | ✓ Exists |
| CC.11 | Lower absence → higher pension | CORE-INV-003 | engine.properties.spec.ts | ✓ Exists |
| CC.12 | Later retirement → higher pension | CORE-INV-004 | engine.properties.spec.ts | ✓ Exists |
| CC.13 | Capital trajectory monotonic | CORE-INV-005 | engine.properties.spec.ts | ✓ Exists |

## Coverage Summary

### By Implementation Status

| Status | Count | Percentage |
|--------|-------|------------|
| ✓ Exists | 30 | 50% |
| ⚠️ Needed | 30 | 50% |
| **Total** | **60** | **100%** |

### By SPEC Section

| Section | Total Req | Covered | Coverage % |
|---------|-----------|---------|------------|
| A. Entitlement | 6 | 3 | 50% |
| B. Wage Projection | 6 | 2 | 33% |
| C. Annual Contributions | 5 | 3 | 60% |
| D. Annual Valorization | 5 | 2 | 40% |
| E. Quarterly Valorization | 8 | 5 | 63% |
| F. Initial Capital | 6 | 3 | 50% |
| G. Sub-Account | 4 | 2 | 50% |
| H. Base and Pension | 9 | 5 | 56% |
| I. Explainability | 6 | 4 | 67% |
| CC. Cross-Cutting | 15 | 9 | 60% |
| **Total** | **60** | **30** | **50%** |

### Priority Gaps (P0 - Must Have)

| Test Case ID | Requirement | File Needed | Priority |
|--------------|-------------|-------------|----------|
| CORE-ANNUAL-001 | Annual valorization timing (31 Jan → 1 June) | annual-valorization.spec.ts | P0 |
| CORE-QUARTER-001 | Quarterly valorization after last annual | quarterly-valorization.spec.ts | P0 |
| CORE-INITCAP-001 | Initial capital special 1999 index | initial-capital.spec.ts | P0 |
| CORE-PENSION-001 | Base capital composition | pension-calcs.spec.ts | P0 |
| CORE-PENSION-002 | Nominal pension calculation | pension-calcs.spec.ts | P0 |
| CORE-CPI-001 | Real pension CPI discount | pension-calcs.spec.ts | P0 |
| CORE-SDZ-001 | Life expectancy windowing | life-expectancy.spec.ts | P0 |
| CORE-ERR-001 | Validation errors | validation.spec.ts | P0 |

## Test File Implementation Plan

### Phase 1: Core Functions (P0)
- [ ] `src/functions/__tests__/annual-valorization.spec.ts`
- [ ] `src/functions/__tests__/quarterly-valorization.spec.ts`
- [ ] `src/functions/__tests__/initial-capital.spec.ts`
- [ ] `src/functions/__tests__/life-expectancy.spec.ts`
- [ ] `src/functions/__tests__/pension-calcs.spec.ts`

### Phase 2: Validation & Error (P0)
- [ ] `src/functions/__tests__/validation.spec.ts`
- [ ] `src/engine/__tests__/error-handling.spec.ts`

### Phase 3: Supporting Functions (P1)
- [ ] `src/functions/__tests__/wage-projection.spec.ts`
- [ ] `src/functions/__tests__/annual-contributions.spec.ts`
- [ ] `src/functions/__tests__/subaccount.spec.ts`
- [ ] `src/functions/__tests__/build-output.spec.ts`

### Phase 4: Integration (P1)
- [ ] Expand `src/engine/__tests__/engine.e2e.spec.ts` with missing scenarios
- [ ] Expand `src/engine/__tests__/engine.properties.spec.ts` with missing invariants

### Phase 5: Golden Fixtures (P2)
- [ ] Migrate `test/engine.spec.ts` to new API
- [ ] Implement fixture loader and validators
- [ ] Create comprehensive fixture set

## Verification Checklist

For each SPEC requirement:
- [ ] Test case ID assigned
- [ ] Test file identified
- [ ] Test implemented and passing
- [ ] Coverage includes happy path
- [ ] Coverage includes edge cases
- [ ] Coverage includes error cases
- [ ] Coverage includes invariants
- [ ] Test is documented in implementation guide
- [ ] Test is included in CI pipeline

## Maintenance

### When SPEC Changes
1. Update this traceability matrix
2. Identify affected test cases
3. Update/add test cases as needed
4. Verify coverage remains 100%
5. Update test plan documents

### When Adding New Test
1. Link to SPEC requirement (or mark as defensive)
2. Assign test case ID
3. Update this matrix
4. Update coverage summary

## References

- [SPEC_ENGINE.md](../SPEC_ENGINE.md) - Actuarial algorithm specification
- [TEST_BLUEPRINT.md](./TEST_BLUEPRINT.md) - Test strategy
- [TEST_IMPLEMENTATION_GUIDE.md](./TEST_IMPLEMENTATION_GUIDE.md) - Implementation guide
- [TEST_PLAN_CORE.md](./TEST_PLAN_CORE.md) - High-level test plan
