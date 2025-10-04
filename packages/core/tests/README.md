# Core Engine Test Suite — Documentation Index

## Overview
This directory contains comprehensive test planning documentation for the ZUS Pension Engine. These documents serve as **specifications** for test implementation, not the tests themselves.

## Documents

### 📋 Strategic Planning

**[TEST_BLUEPRINT.md](./TEST_BLUEPRINT.md)**  
Comprehensive blueprint for testing the engine. Defines test categories, execution strategy, patterns, coverage matrix, and acceptance criteria.

**[TEST_PLAN_CORE.md](./TEST_PLAN_CORE.md)**  
High-level test strategy overview. Environment setup, pass/fail criteria, and testing philosophy.

**[TRACEABILITY_MATRIX.md](./TRACEABILITY_MATRIX.md)**  
Maps every requirement in SPEC_ENGINE.md to test cases. Tracks coverage and implementation status.

### 🎯 Fixture Planning

**[GOLDEN_FIXTURE_PLAN.md](./GOLDEN_FIXTURE_PLAN.md)**  
Complete guide to golden fixtures: schemas, categories, validation rules, and migration strategy. Includes structural-only testing for demo providers and future numeric golden snapshots.

**[GOLDEN_FIXTURE_PROTOCOL.md](./GOLDEN_FIXTURE_PROTOCOL.md)**  
Brief protocol summary for structural expectations and symbolic IDs.

### 🛠️ Implementation Guides

**[TEST_IMPLEMENTATION_GUIDE.md](./TEST_IMPLEMENTATION_GUIDE.md)**  
Practical step-by-step guide for writing tests. Includes patterns, examples, debugging tips, and test case catalog.

**[TEST_MATRIX_FUNCTIONS.md](./TEST_MATRIX_FUNCTIONS.md)**  
Matrix of engine functions with inputs, preconditions, expected outputs, invariants, and error conditions.

### 📝 Test Case Specifications

Detailed test case tables organized by domain:

- **[TEST_CASES_QUARTERLY.md](./TEST_CASES_QUARTERLY.md)** - Quarterly valorization mapping rules
- **[TEST_CASES_INITIAL_CAPITAL.md](./TEST_CASES_INITIAL_CAPITAL.md)** - Special 1999 index application
- **[TEST_CASES_LIFE_EXPECTANCY.md](./TEST_CASES_LIFE_EXPECTANCY.md)** - SDŻ windowing logic
- **[TEST_CASES_REAL_VS_NOMINAL.md](./TEST_CASES_REAL_VS_NOMINAL.md)** - CPI discount calculations
- **[TEST_CASES_CONTRIBUTIONS_ABSENCE.md](./TEST_CASES_CONTRIBUTIONS_ABSENCE.md)** - Absence factor impact
- **[TEST_CASES_REPLACEMENT_AND_PRESENTATION.md](./TEST_CASES_REPLACEMENT_AND_PRESENTATION.md)** - Replacement rate bounds
- **[TEST_CASES_NEGATIVE_AND_ERROR_STATES.md](./TEST_CASES_NEGATIVE_AND_ERROR_STATES.md)** - Error handling

### 🔧 Supporting Documents

**[NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md)**  
Test case naming conventions (CORE-XXX-###) and Gherkin-style titles.

**[COVERAGE_AND RISKS.md](./COVERAGE_AND RISKS.md)**  
Coverage requirements, traceability, risks, and acceptance criteria.

**[DETERMINISTIC_DEMO_PROVIDER_SPEC.md](./DETERMINISTIC_DEMO_PROVIDER_SPEC.md)**  
Specification for demo provider behavior and determinism requirements.

## Quick Start

### For Test Writers

1. Read **[TEST_BLUEPRINT.md](./TEST_BLUEPRINT.md)** for overall strategy
2. Consult **[TEST_IMPLEMENTATION_GUIDE.md](./TEST_IMPLEMENTATION_GUIDE.md)** for practical patterns
3. Check **[TRACEABILITY_MATRIX.md](./TRACEABILITY_MATRIX.md)** for coverage gaps
4. Use **[GOLDEN_FIXTURE_PLAN.md](./GOLDEN_FIXTURE_PLAN.md)** for fixture creation

### For Reviewers

1. Verify coverage using **[TRACEABILITY_MATRIX.md](./TRACEABILITY_MATRIX.md)**
2. Check test quality against **[TEST_BLUEPRINT.md](./TEST_BLUEPRINT.md)** standards
3. Validate fixture structure using **[GOLDEN_FIXTURE_PLAN.md](./GOLDEN_FIXTURE_PLAN.md)**

### For Stakeholders

1. Review **[TEST_PLAN_CORE.md](./TEST_PLAN_CORE.md)** for high-level strategy
2. Check **[COVERAGE_AND RISKS.md](./COVERAGE_AND RISKS.md)** for risks
3. Monitor **[TRACEABILITY_MATRIX.md](./TRACEABILITY_MATRIX.md)** for progress

## Document Relationships

```
SPEC_ENGINE.md (Source of Truth)
    ↓
TRACEABILITY_MATRIX.md (Maps spec → tests)
    ↓
TEST_BLUEPRINT.md (Test architecture)
    ↓
TEST_IMPLEMENTATION_GUIDE.md (Practical patterns)
    ↓
TEST_CASES_*.md (Specific scenarios)
    ↓
Actual Test Files (Implementation)
```

## Implementation Status

| Category | Documents | Implementation Files |
|----------|-----------|---------------------|
| Planning | ✅ Complete | - |
| Unit Tests | ✅ Spec ready | ⚠️ Partial |
| Integration | ✅ Spec ready | ✅ Basic coverage |
| Properties | ✅ Spec ready | ✅ Basic coverage |
| Golden Fixtures | ✅ Spec ready | ⚠️ Migration needed |
| Error Handling | ✅ Spec ready | ⚠️ Needed |

See **[TRACEABILITY_MATRIX.md](./TRACEABILITY_MATRIX.md)** for detailed status.

## Coverage Goals

| Metric | Target | Current |
|--------|--------|---------|
| Spec Coverage | 100% | 50% |
| Code Coverage | 90%+ | TBD |
| Function Coverage | 100% | ~70% |
| Error Cases | 100% | ~30% |

## Test Types Distribution

```
Unit Tests (40%)
  └─ Function-level logic, edge cases, invariants

Integration Tests (25%)
  └─ Full pipeline, data flow, postconditions

Property Tests (20%)
  └─ Mathematical invariants, metamorphic properties

Golden Fixtures (10%)
  └─ Known scenarios, regression prevention

Error Tests (5%)
  └─ Validation, provider errors, business logic errors
```

## Next Steps

### Phase 1: Core Unit Tests (Priority: P0)
- [ ] Implement missing function tests per TRACEABILITY_MATRIX
- [ ] Cover all happy paths, edge cases, errors
- [ ] Validate all invariants

### Phase 2: Error Handling (Priority: P0)
- [ ] Implement validation error tests
- [ ] Implement provider error tests
- [ ] Implement business logic error tests

### Phase 3: Golden Fixtures (Priority: P1)
- [ ] Migrate existing fixtures to new structure
- [ ] Implement fixture loader and validators
- [ ] Create comprehensive fixture set

### Phase 4: Numeric Golden (Priority: P2)
- [ ] Wait for production provider implementation
- [ ] Generate numeric baselines
- [ ] Version fixture directories

## References

### Internal
- [../SPEC_ENGINE.md](../SPEC_ENGINE.md) - Actuarial algorithm specification
- [../ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture
- [../README.md](../README.md) - Package overview

### External
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Property-Based Testing](https://hypothesis.works/articles/what-is-property-based-testing/)
- [Golden Testing](https://ro-che.info/articles/2017-12-04-golden-tests)

## Maintenance

### When to Update

**Add new document when:**
- New testing approach introduced
- New test category needed
- Significant strategy change

**Update existing document when:**
- Spec changes
- Coverage gaps identified
- Implementation patterns evolve
- Test infrastructure changes

### Document Owners

| Document | Owner | Reviewers |
|----------|-------|-----------|
| TEST_BLUEPRINT.md | Test Lead | Architects, QA |
| GOLDEN_FIXTURE_PLAN.md | Test Lead | Developers |
| TRACEABILITY_MATRIX.md | Test Lead | All |
| TEST_IMPLEMENTATION_GUIDE.md | Senior Dev | Team |

## Support

For questions or clarifications:
1. Check this index for relevant documentation
2. Review examples in implementation guide
3. Consult traceability matrix for coverage
4. Open issue with tag `area:testing` and `type:question`

---

**Last Updated:** 2025-01-04  
**Version:** 1.0.0  
**Status:** ✅ Complete (Specification Phase)
