# Scenario Engine v2 API Documentation

## Overview

The Scenario Engine v2 provides step-by-step pension calculation endpoints designed for the wizard UI. It supports instant previews, multi-period career composition, and scenario comparisons.

## Base URL

```
http://localhost:4000/api/scenarios
```

## Endpoints

### 1. JDG Quick Calculation

Fast pension preview for self-employed (JDG) workers.

**Endpoint:** `POST /scenarios/jdg-quick`

**Request Body:**
```json
{
  "birthYear": 1985,
  "gender": "M",
  "age": 40,
  "monthlyIncome": 8000,
  "isRyczalt": false
}
```

**Request Schema:**
- `birthYear` (number, required): Birth year (1940-2010)
- `gender` (string, required): "M" or "F"
- `age` (number, required): Current age (18-100)
- `monthlyIncome` (number, required): Monthly income in PLN (0-1,000,000)
- `isRyczalt` (boolean, required): Whether using lump-sum taxation

**Response:**
```json
{
  "scenario": {
    "retirementAge": 65,
    "retirementYear": 2050,
    "retirementQuarter": 2,
    "gender": "M"
  },
  "nominalPension": 3500.50,
  "realPension": 2800.75,
  "replacementRate": 0.58,
  "capitalTrajectory": [
    {
      "year": 2025,
      "capital": 0
    },
    {
      "year": 2030,
      "capital": 45000
    }
  ],
  "assumptions": {
    "startWorkYear": 2007,
    "contributionBase": 4800,
    "contributionRate": 0.1952
  }
}
```

**Usage Example:**
```typescript
import { calculateJdgQuick } from './services/api';

const result = await calculateJdgQuick({
  birthYear: 1985,
  gender: 'M',
  age: 40,
  monthlyIncome: 8000,
  isRyczalt: false,
});

console.log(`Nominal pension: ${result.nominalPension} PLN`);
console.log(`Real pension (today): ${result.realPension} PLN`);
console.log(`Replacement rate: ${(result.replacementRate * 100).toFixed(1)}%`);
```

---

### 2. Compose Career

Multi-period career simulation with different contract types.

**Endpoint:** `POST /scenarios/compose`

**Request Body:**
```json
{
  "birthYear": 1985,
  "gender": "M",
  "careerPeriods": [
    {
      "contractType": "jdg",
      "yearsOfWork": 10,
      "monthlyIncome": 5000
    },
    {
      "contractType": "uop",
      "yearsOfWork": 15,
      "monthlyIncome": 8000
    },
    {
      "contractType": "jdg_ryczalt",
      "yearsOfWork": 5,
      "monthlyIncome": 6000
    }
  ],
  "retirementAge": 67,
  "claimMonth": 6
}
```

**Request Schema:**
- `birthYear` (number, required): Birth year (1940-2010)
- `gender` (string, required): "M" or "F"
- `careerPeriods` (array, required): 1-10 career periods
  - `contractType` (string, required): "uop" | "jdg" | "jdg_ryczalt"
  - `yearsOfWork` (number, required): Years in this period (1-50)
  - `monthlyIncome` (number, required): Monthly income in PLN (0-1,000,000)
  - `startYear` (number, optional): Start year for precise ordering
- `retirementAge` (number, optional): Retirement age (60-70)
- `claimMonth` (number, optional): Month to claim pension (1-12)

**Contract Types:**
- `uop`: Employment contract (Umowa o Pracę) - full contribution base
- `jdg`: Self-employment (JDG) - 60% of income as contribution base
- `jdg_ryczalt`: Self-employment with lump-sum tax - minimum contribution base

**Response:**
```json
{
  "scenario": {
    "retirementAge": 67,
    "retirementYear": 2052,
    "claimMonth": 6,
    "gender": "M",
    "totalWorkYears": 30
  },
  "monthlyPensionNominal": 4200.00,
  "monthlyPensionRealToday": 3100.50,
  "replacementRate": 0.52,
  "capitalTrajectory": [
    {
      "year": 2022,
      "annualWage": 60000,
      "annualContribution": 11712,
      "cumulativeCapital": 12000
    }
  ],
  "periodBreakdown": [
    {
      "contractType": "jdg",
      "years": 10,
      "avgIncome": 5000,
      "totalContributions": 58560
    },
    {
      "contractType": "uop",
      "years": 15,
      "avgIncome": 8000,
      "totalContributions": 140544
    }
  ],
  "finalization": {
    "quarterUsed": "Q2",
    "finalCapital": 520000
  }
}
```

**Usage Example:**
```typescript
import { composeCareer } from './services/api';

const result = await composeCareer({
  birthYear: 1985,
  gender: 'M',
  careerPeriods: [
    { contractType: 'jdg', yearsOfWork: 10, monthlyIncome: 5000 },
    { contractType: 'uop', yearsOfWork: 20, monthlyIncome: 8000 },
  ],
});

console.log(`Total work years: ${result.scenario.totalWorkYears}`);
console.log(`Monthly pension: ${result.monthlyPensionNominal} PLN`);

result.periodBreakdown.forEach((period, i) => {
  console.log(`Period ${i + 1}: ${period.contractType} for ${period.years} years`);
  console.log(`  Total contributions: ${period.totalContributions} PLN`);
});
```

---

### 3. Compare Scenarios

Compare different pension scenarios.

**Endpoint:** `POST /scenarios/compare`

**Request Body:**
```json
{
  "baseScenario": {
    "birthYear": 1985,
    "gender": "M",
    "age": 40,
    "monthlyIncome": 8000,
    "isRyczalt": false
  },
  "comparisonType": "uop_vs_jdg",
  "comparisonParams": {
    "zusMultiplier": 1.5,
    "delayYears": 2
  }
}
```

**Request Schema:**
- `baseScenario` (object, required): Either JdgQuickRequest or ComposeCareerRequest
- `comparisonType` (string, required): "uop_vs_jdg" | "higher_zus" | "delayed_retirement"
- `comparisonParams` (object, optional):
  - `zusMultiplier` (number, optional): Multiplier for higher ZUS (1-3)
  - `delayYears` (number, optional): Years to delay retirement (1-5)

**Comparison Types:**

1. **uop_vs_jdg**: Compare self-employment (JDG) with employment contract (UoP)
   - Requires JdgQuickRequest as baseScenario
   - Compares contribution bases and pension outcomes

2. **higher_zus**: Compare current vs higher contribution base
   - Uses zusMultiplier parameter (e.g., 1.5 = 50% higher)
   - Shows impact of paying higher ZUS contributions

3. **delayed_retirement**: Compare retiring now vs later
   - Uses delayYears parameter
   - Requires ComposeCareerRequest as baseScenario

**Response:**
```json
{
  "base": {
    "label": "JDG",
    "pension": 3500.00,
    "pensionReal": 2800.00,
    "replacementRate": 0.58
  },
  "comparison": {
    "label": "Umowa o pracę (UoP)",
    "pension": 4200.00,
    "pensionReal": 3300.00,
    "replacementRate": 0.65
  },
  "difference": {
    "absolute": 700.00,
    "percentage": 20.0
  },
  "recommendation": "Umowa o pracę może dać wyższą emeryturę dzięki pełnej podstawie składkowej"
}
```

**Usage Examples:**

```typescript
import { compareScenarios } from './services/api';

// Example 1: UoP vs JDG comparison
const uopVsJdg = await compareScenarios({
  baseScenario: {
    birthYear: 1985,
    gender: 'M',
    age: 40,
    monthlyIncome: 8000,
    isRyczalt: false,
  },
  comparisonType: 'uop_vs_jdg',
});

console.log(`${uopVsJdg.comparison.label}: ${uopVsJdg.comparison.pension} PLN`);
console.log(`Difference: ${uopVsJdg.difference.percentage.toFixed(1)}%`);

// Example 2: Higher ZUS comparison
const higherZus = await compareScenarios({
  baseScenario: {
    birthYear: 1985,
    gender: 'M',
    age: 40,
    monthlyIncome: 8000,
    isRyczalt: false,
  },
  comparisonType: 'higher_zus',
  comparisonParams: {
    zusMultiplier: 1.5, // 50% higher contributions
  },
});

console.log(`Recommendation: ${higherZus.recommendation}`);
```

---

## Error Handling

All endpoints return standardized error responses:

**Validation Error (400):**
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Input validation failed",
  "details": {
    "issues": [
      {
        "path": "birthYear",
        "message": "Number must be greater than or equal to 1940"
      }
    ]
  },
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "hint": "Check birthYear, gender, age, monthlyIncome, and isRyczalt fields"
}
```

**Internal Error (500):**
```json
{
  "code": "INTERNAL_ERROR",
  "message": "Calculation failed",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Request Correlation

All endpoints support the `X-Correlation-Id` header for request tracking:

```bash
curl -X POST http://localhost:4000/scenarios/jdg-quick \
  -H "Content-Type: application/json" \
  -H "X-Correlation-Id: my-session-123" \
  -d '{"birthYear": 1985, ...}'
```

The correlation ID is returned in the response headers and error objects.

---

## Integration with Wizard

### Step 3→4: JDG Quick Calculation

```typescript
// In Wizard.tsx
const handleNext = async () => {
  if (currentStep === 3 && gender && age && jdgIncome > 0) {
    const birthYear = new Date().getFullYear() - age;
    const result = await calculateJdgQuick({
      birthYear,
      gender: gender === 'male' ? 'M' : 'F',
      age,
      monthlyIncome: jdgIncome,
      isRyczalt,
    });
    setQuickCalcResult(result);
    nextStep();
  }
};
```

### Step 5: Compose Career

```typescript
// In Step5RefineCompare.tsx
const handleCompose = async () => {
  const result = await composeCareer({
    birthYear: 1985,
    gender: 'M',
    careerPeriods: careerPeriods.map(p => ({
      contractType: p.contractType,
      yearsOfWork: p.yearsOfWork,
      monthlyIncome: p.monthlyIncome,
    })),
  });
  setFinalResult(result);
};
```

---

## Calculation Logic

### Contribution Base Calculation

Different contract types have different contribution bases:

1. **UoP (Employment)**: Full salary
   ```
   contributionBase = monthlyIncome
   ```

2. **JDG (Self-employment)**: 60% of income
   ```
   contributionBase = monthlyIncome * 0.60
   ```

3. **JDG Ryczałt (Lump-sum tax)**: Minimum base
   ```
   contributionBase = min(monthlyIncome * 0.30, 4500)
   ```

### Multi-Period Weighted Average

For career composition, a weighted average is calculated:

```
weightedIncome = Σ(contributionBase_i × years_i)
avgContributionBase = weightedIncome / totalYears
```

---

## Testing

### cURL Examples

**JDG Quick:**
```bash
curl -X POST http://localhost:4000/scenarios/jdg-quick \
  -H "Content-Type: application/json" \
  -d '{
    "birthYear": 1985,
    "gender": "M",
    "age": 40,
    "monthlyIncome": 8000,
    "isRyczalt": false
  }'
```

**Compose Career:**
```bash
curl -X POST http://localhost:4000/scenarios/compose \
  -H "Content-Type: application/json" \
  -d '{
    "birthYear": 1985,
    "gender": "M",
    "careerPeriods": [
      {"contractType": "jdg", "yearsOfWork": 10, "monthlyIncome": 5000},
      {"contractType": "uop", "yearsOfWork": 15, "monthlyIncome": 8000}
    ]
  }'
```

**Compare Scenarios:**
```bash
curl -X POST http://localhost:4000/scenarios/compare \
  -H "Content-Type: application/json" \
  -d '{
    "baseScenario": {
      "birthYear": 1985,
      "gender": "M",
      "age": 40,
      "monthlyIncome": 8000,
      "isRyczalt": false
    },
    "comparisonType": "uop_vs_jdg"
  }'
```

---

## Known Limitations

1. **Demo Provider Data**: Current implementation uses demo valorization data which may produce unrealistic values for long-term projections. This is a limitation of the core engine's demo provider, not the scenario API.

2. **Start Year Estimation**: The API estimates start work year as birthYear + 22. For more accurate results, use the compose endpoint with explicit career periods.

3. **Comparison Logic**: Some comparison types require specific base scenarios (e.g., UoP vs JDG requires JdgQuickRequest).

---

## Future Enhancements

1. Add support for initial capital and sub-account balances
2. Support for absence factors (sick leave, unpaid leave)
3. Regional adjustments (powiat-based averages)
4. Stochastic simulations with uncertainty ranges
5. Export scenario comparisons to PDF/XLS
