# Core Engine Architecture — ZUS Retirement Simulator

## Overview

The `@zus/core` package implements the actuarial pension calculation engine according to official ZUS (Social Insurance Institution of Poland) rules. The engine is **pure, deterministic, and provider-based**, ensuring consistent and verifiable results.

## Design Principles

1. **Pure Functions**: No I/O, no side effects, no randomness
2. **Provider Pattern**: All data sources injected via interfaces
3. **Type Safety**: Strict TypeScript with explicit return types
4. **Testability**: Deterministic calculations with reproducible outputs
5. **Transparency**: Full audit trail with assumptions and explainers

## Key Components

### 1. Public Contracts (`contracts.ts`)

Defines the public API surface for the engine:

- **EngineInput**: User parameters (birth year, salary, retirement age, etc.)
- **EngineOutput**: Calculation results (pensions, trajectory, assumptions)
- **Value Objects**: TrajectoryRowVO, FinalizationVO, AssumptionsVO
- **Engine Interface**: `calculate(input, providers) → output`

### 2. Provider Interfaces (`providers.ts`)

Six core provider interfaces supply all external data:

#### AnnualValorizationProvider
- Supplies annual valorization indices (e.g., 1.03 for 3% growth)
- Used for compounding capital year-over-year
- Maps: `year → { id, rate }`

#### QuarterlyValorizationProvider
- Supplies quarterly indices for final year adjustments
- Maps claim month to entitlement quarter (Q1/Q2/Q3/Q4)
- Applies quarter-specific valorization mapping per ZUS rules

#### InitialCapitalProvider
- Supplies special 1999 index for initial capital
- Provides annual indices for capital accumulated before 2000
- Critical for older workers with pre-1999 contributions

#### LifeExpectancyProvider
- Returns SDŻ (średnie dalsze życie - average remaining life)
- Gender and date-dependent with Apr-Mar windowing
- Used to calculate monthly pension divisor

#### MacroProjectionProvider
- Wage growth factors (backcast & forecast)
- CPI discount factors (nominal → real conversion)
- Anchored to simulation year (default 2025)

#### ContributionRuleProvider
- Contribution rate (19.52% standard)
- Absence factor bounds validation
- Rule versioning support

#### SubAccountProvider (Optional)
- Valorization for OFE transfers and sub-accounts
- Only applied when balance present

### 3. Calculation Pipeline

The engine executes these steps in strict order (see `SPEC_ENGINE.md` and `pipeline.md`):

**A. Entitlement Setup** (`derive-entitlement.ts`)
- Compute retirement age (gender defaults if not provided)
- Determine entitlement year and claim date
- Map claim month to entitlement quarter

**B. Wage Projection** (`wages.ts`)
- Annual wage series from start year to retirement
- Backcast from anchor year or forward project
- Uses macro wage growth factors

**C. Annual Contributions** (`contributions.ts`)
- Contribution = wage × rate × absence factor
- Rate from ContributionRuleProvider
- Absence factor bounds-checked

**D. Annual Valorization** (`annual-valorization.ts`)
- Apply annual index to accumulated capital
- Index for year Y applies to contributions by 31 Jan Y
- Cumulative compounding, chronological order

**E. Quarterly Valorization** (`quarterly-valorization.ts`)
- Final year: contributions after last 31 Jan
- Quarter mapping: Q1→Q3 prev, Q2→Q4 prev, Q3→Q1 curr, Q4→Q2 curr
- Compounded indices applied in order

**F. Initial Capital** (`initial-capital.ts`)
- Special 1999 index applied once (1 June 2000)
- Then annual path like regular contributions
- Quarterly rules apply at entitlement

**G. Compose Base** (`compose-base.ts`)
- Base = contributions + initial capital + sub-account
- All components summed, non-negative check

**H. Life Expectancy & Pension** (`life-expectancy.ts`, `pension-calcs.ts`)
- SDŻ from provider (gender, claim date window)
- Nominal pension = base / (SDŻ × 12)
- Real pension = nominal / CPI discount factor
- Replacement rate = real / current gross monthly

**I. Build Output** (`build-output.ts`)
- Format trajectory with yearly breakdown
- Record finalization step (quarterly)
- Emit assumptions (index IDs, table IDs, provider kind)
- Generate explainers for transparency

## Function Decomposition

All functions are **pure** with explicit **preconditions**, **postconditions**, and **invariants**:

| Function | Input | Output | Invariants |
|----------|-------|--------|------------|
| deriveEntitlement | input, providers | EntitlementContext | age legal, chronology valid |
| projectAnnualWageSeries | input, macro, anchor | YearlyWage[] | chronological, ≥ 0 |
| computeAnnualContributions | wages, rate, absence | YearlyContribution[] | same length, ≥ 0 |
| applyAnnualValorization | contribs, provider | AnnualValorizedState[] | monotone capital |
| valorizeInitialCapital | initial, providers, year | ValorizedInitialCapital | 1999 index once |
| applyQuarterlyValorization | annual, quarter, provider | FinalizationStep | correct mapping |
| composeBase | components | BaseComposition | base ≥ sum |
| selectLifeExpectancy | gender, date, provider | LifeExpectancySelection | years > 0 |
| computeNominalMonthly | base, years | number | ≥ 0 |
| discountToReal | nominal, macro, dates | number | real ≤ nominal |
| computeReplacement | real, current | number | 0 ≤ rate ≤ 1.5 |
| buildOutput | all | EngineOutput | trajectory length correct |

See `TEST_MATRIX_FUNCTIONS.md` for comprehensive test coverage requirements.

## Provider Implementations

### Demo Providers (`providers-impl/demo/`)

Deterministic demo implementations for development and testing:

- **Geometric growth models** (e.g., 3% annual, 0.7-1% quarterly)
- **Smooth gender-based life expectancy** (base + cohort adjustment)
- **Fixed contribution rate** (19.52%)
- **Stable wage/CPI paths** (4% wage growth, 2% inflation)

Used via `makeDemoProviderBundle()` and `buildEngineWithDemoProviders()`.

### Production Providers (Future)

Will load from official ZUS/FUS tables in `packages/data`:
- Annual/quarterly indices from Excel files
- SDŻ tables from actuarial publications
- Macroeconomic projections from official sources

## Type Safety & Validation

- **No `any` types** in production code
- **Explicit return types** on all functions
- **Branded types** at API boundaries (via `@zus/types`)
- **Runtime validation** via Zod schemas (API layer)
- **Assertion utilities** for internal checks (`utils/assert.ts`)

## Error Handling

Typed error categories:
- `VALIDATION_ERROR`: Input bounds violations
- `DOMAIN_CONSTRAINT`: Business rule violations
- `NOT_FOUND`: Missing data (index, table)
- `COMPUTATION_ERROR`: Math/overflow issues

All errors thrown with prefix for tracing.

## Testing Strategy

1. **Unit Tests**: Each function in isolation
2. **Property Tests**: Invariant checking (monotonicity, bounds)
3. **Integration Tests**: Full pipeline with demo providers
4. **Golden Tests**: Verified outputs against fixtures
5. **Edge Case Coverage**: Short careers, extreme ages, boundary conditions

See `tests/TEST_PLAN_CORE.md` for complete test matrix.

## Documentation Map

- `README.md` — Package overview and usage
- `SPEC_ENGINE.md` — Algorithm specification (Steps A-I)
- `ARCHITECTURE.md` — This document (design & structure)
- `src/pipeline.md` — Function decomposition & invariants
- `src/README.md` — Domain glossary & constraints
- `src/checks.md` — Validation rules
- `src/rounding-and-precision.md` — Numerical handling
- `tests/*.md` — Test specifications and protocols

## Usage Example

```typescript
import { Engine, makeDemoProviderBundle, EngineInput } from '@zus/core';

const providers = makeDemoProviderBundle({ anchorYear: 2025 });

const input: EngineInput = {
  birthYear: 1980,
  gender: 'M',
  startWorkYear: 2000,
  currentGrossMonthly: 8000,
  retirementAge: 65,
  claimMonth: 6,
};

const output = Engine.calculate(input, providers);

console.log(output.monthlyPensionNominal);      // e.g., 4500 PLN
console.log(output.monthlyPensionRealToday);    // e.g., 3200 PLN (2025 money)
console.log(output.replacementRate);             // e.g., 0.40 (40%)
console.log(output.assumptions);                 // Index IDs, table IDs, provider kind
console.log(output.explainers);                  // Audit trail explanations
```

## Integration Points

- **API Layer** (`apps/api`): Validates inputs, calls engine, formats responses
- **Data Package** (`packages/data`): Official tables loaded as providers
- **Types Package** (`packages/types`): Shared DTOs and Zod schemas
- **Web App** (`apps/web`): Visualizes trajectory, downloads reports

## Future Enhancements

1. **Stochastic Providers**: Monte Carlo simulations with uncertainty
2. **Scenario Comparison**: Multiple provider bundles in parallel
3. **Optimization**: Retirement date optimization for max pension
4. **Regional Adjustments**: Powiat-based averages (from data files)
5. **Title Code Segmentation**: Profession-based corrections

---

**Version**: 1.0.0  
**Status**: Specification Complete ✅  
**Last Updated**: October 2025
