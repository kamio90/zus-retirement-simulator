# ZUS Retirement Simulator — Pension Calculation Engine

## Principles
- Pure, deterministic, referentially transparent (no I/O, no randomness)
- Parameterized by provider interfaces (indices, macro, SDŻ, etc.)
- Compatible with DTOs and branded types from `packages/types`
- Supports both demo and official provider modes

## How We Compute (Canonical Algorithm v1.0)

This section explains the **exact mathematical formula** used to calculate your pension. The algorithm follows official ZUS rules with precise ordering and guardrails.

### Step-by-Step Calculation

#### 1. **Annual Contributions**
For each working year:
```
monthlyBase = gross monthly salary (UoP) or declared base (JDG)
monthlyContribution = monthlyBase × 19.52%
annualContribution = monthlyContribution × 12 × absenceFactor
```

#### 2. **Annual Valorization** (Applied June 1st each year)
For each year from first work year to retirement:
```
BASE[year] = CAP[year-1] + annualContribution[year]
CAP[year] = BASE[year] × (1 + W[year-1])
```
Where `W[year-1]` is the **annual valorization index as a fraction** (e.g., 0.10 for 10%).

**Example:** If you contributed 11,712 PLN in 2024 and W[2024] = 0.10:
- CAP[2025] = 11,712 × (1 + 0.10) = 12,883.20 PLN

#### 3. **Quarterly Valorization** (After last annual)
After the final June 1st valorization, apply **cumulative quarterly indices** up to your claim quarter:

- **Q1 claim**: Apply [Q3 previous year]
- **Q2 claim**: Apply [Q3 prev, Q4 prev]
- **Q3 claim**: Apply [Q3 prev, Q4 prev, Q1 current]
- **Q4 claim**: Apply [Q3 prev, Q4 prev, Q1 current, Q2 current]

Each quarterly index is a **fraction** applied as:
```
K = CAP_final
for each (year, quarter) in sequence:
   K = K × (1 + quarterIndex[year][quarter])
```

**Example for Q2:** Capital = 12,883.20 × (1 + 0.010) × (1 + 0.012) = 13,167.77 PLN

#### 4. **Initial Capital from 1999** (if applicable)
If you have initial capital (pre-1999):
```
KP[2000] = initialCapital × 1.1560  // Special 115.60% multiplier
For year 2001..retirement:
   KP[year] = KP[year-1] × (1 + W[year-1])
```
Final capital = contributions capital + initial capital

#### 5. **Life Expectancy (SDŻ)**
Retrieved from actuarial tables based on:
- Gender (M/F)
- Claim year and quarter
- Window logic: April 1 - March 31 uses same table

#### 6. **Monthly Pension (Nominal)**
```
monthlyPensionNominal = finalCapital / (SDŻ_years × 12)
```

#### 7. **Monthly Pension (Real, in today's money)**
```
cpiDiscount = CPI_factor(retirementYear → todayYear)
monthlyPensionReal = monthlyPensionNominal / cpiDiscount
```
If retirement is in the future, CPI > 1 means real < nominal (discounting).

#### 8. **Replacement Rate**
```
replacementRate = monthlyPensionReal / currentGrossMonthly
```

### Guards & Validation

The engine includes comprehensive guards to prevent invalid results:

1. **Index Range Checks:**
   - Annual indices: -0.5 ≤ W ≤ 1.0
   - Quarterly indices: -0.3 ≤ Q ≤ 0.5
   - Indices outside these ranges trigger `ANNUAL_INDEX_OUT_OF_RANGE` or `QUARTERLY_INDEX_OUT_OF_RANGE`

2. **Numeric Overflow Protection:**
   - All intermediate calculations checked for `isFinite()`
   - NaN or Infinity triggers `NUMERIC_OVERFLOW_OR_NAN` with step context

3. **Input Validation:**
   - Life expectancy must be > 0
   - CPI discount must be positive
   - Contributions must be non-negative

### Example Calculation

**Scenario:**
- Gender: M
- Monthly salary: 5,000 PLN
- Work period: 1 year (2023)
- Retirement: 2024 Q2
- Annual index 2024: 0.10 (10%)
- Quarterly: Q3'23=0.010, Q4'23=0.012
- SDŻ: 18 years
- CPI: 1.05

**Steps:**
1. Annual contribution 2023: 5,000 × 12 × 0.1952 = 11,712 PLN
2. Annual valorization 2024: 11,712 × 1.10 = 12,883.20 PLN
3. Quarterly for Q2: 12,883.20 × 1.010 × 1.012 = 13,167.77 PLN
4. Monthly nominal: 13,167.77 / (18 × 12) = 60.96 PLN
5. Monthly real: 60.96 / 1.05 = 58.06 PLN
6. Replacement rate: 58.06 / 5,000 = 1.16%

## Usage
- Plug in a `ProviderBundle` (demo or official)
- Call `calculate(input, providers)` with validated input
- Engine guarantees: same input + same providers = same output
- No file access, logging, or side effects
