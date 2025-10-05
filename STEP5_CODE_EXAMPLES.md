# Step 5 Fix - Code Examples

## What Changed

### 1. Backend - Adding No-Contribution Support

**Before:**
```typescript
function getContributionBase(income: number, contractType: ContractType): number {
  switch (contractType) {
    case 'uop':
      return income;
    case 'jdg':
      return income * 0.6;
    case 'jdg_ryczalt':
      return Math.min(income * 0.3, 4500);
    default:
      return income;
  }
}
```

**After:**
```typescript
function getContributionBase(income: number, contractType: ContractType): number {
  switch (contractType) {
    case 'uop':
      return income;
    case 'jdg':
      return income * 0.6;
    case 'jdg_ryczalt':
      return Math.min(income * 0.3, 4500);
    case 'no_contribution':  // ✅ NEW!
      return 0;               // No contributions for this period
    default:
      return income;
  }
}
```

### 2. Frontend - Using Correct API

**Before (INCORRECT):**
```typescript
// ❌ Using wrong API
import { simulateV2 } from '../../services/v2-api';
import type { SimulateV2Request, SimulateV2Response } from '@zus/types';

const handleComputePrecisePension = async () => {
  const request: SimulateV2Request = {
    baselineContext: { /* ... */ },
    // variants: [], // TODO: Map career periods
  };
  
  const result = await simulateV2(request, corrId);
  // Wrong result structure!
};
```

**After (CORRECT):**
```typescript
// ✅ Using correct API
import { composeCareer } from '../../services/api';
import type { ComposeCareerRequest, ComposeCareerResult } from '@zus/types';

const handleComputePrecisePension = async () => {
  const request: ComposeCareerRequest = {
    birthYear,
    gender: gender === 'male' ? 'M' : 'F',
    careerPeriods: careerPeriods.map(p => ({
      contractType: p.contractType,
      yearsOfWork: p.yearsOfWork,
      monthlyIncome: p.monthlyIncome,
    })),
    retirementAge,
    claimMonth,
  };
  
  const result = await composeCareer(request);
  // Correct result structure!
};
```

### 3. Average Income Calculation

**Before:**
```typescript
// ❌ Includes periods without income in average
const avgIncome = careerPeriods.length > 0
  ? Math.round(
      careerPeriods.reduce((sum, p) => sum + p.monthlyIncome, 0) / 
      careerPeriods.length
    )
  : 0;
```

**After:**
```typescript
// ✅ Excludes no-contribution periods from average
const avgIncome = careerPeriods.length > 0
  ? Math.round(
      careerPeriods
        .filter((p) => p.contractType !== 'no_contribution')
        .reduce((sum, p) => sum + p.monthlyIncome, 0) /
        Math.max(
          careerPeriods.filter((p) => p.contractType !== 'no_contribution').length,
          1
        )
    )
  : 0;
```

### 4. Result Display Mapping

**Before (INCORRECT):**
```typescript
// ❌ Wrong path to result data
<p className="text-2xl font-bold text-green-900">
  {Math.round(computeResult.baselineResult.kpi.monthlyNominal).toLocaleString('pl-PL')} PLN
</p>
```

**After (CORRECT):**
```typescript
// ✅ Correct path to result data
<p className="text-2xl font-bold text-green-900">
  {Math.round(computeResult.monthlyPensionNominal).toLocaleString('pl-PL')} PLN
</p>
```

## Usage Examples

### Example 1: Career with No-Contribution Period

```typescript
const careerWithUnemployment = {
  birthYear: 1990,
  gender: 'M',
  careerPeriods: [
    {
      contractType: 'uop',
      yearsOfWork: 10,
      monthlyIncome: 5000,
    },
    {
      contractType: 'no_contribution',  // Unemployment period
      yearsOfWork: 1,
      monthlyIncome: 0,
    },
    {
      contractType: 'uop',
      yearsOfWork: 14,
      monthlyIncome: 7000,
    },
  ],
  retirementAge: 65,
  claimMonth: 6,
};

const result = await composeCareer(careerWithUnemployment);
// Total work years: 25 (10 + 1 + 14)
// Average income: 6000 PLN (excludes the 1-year no-contribution period)
```

### Example 2: Early Retirement

```typescript
const earlyRetirement = {
  birthYear: 1990,
  gender: 'F',
  careerPeriods: [
    {
      contractType: 'uop',
      yearsOfWork: 20,
      monthlyIncome: 6000,
    },
  ],
  retirementAge: 55,  // Early retirement (normal is 60 for women)
  claimMonth: 6,
};
```

### Example 3: Delayed Retirement

```typescript
const delayedRetirement = {
  birthYear: 1990,
  gender: 'M',
  careerPeriods: [
    {
      contractType: 'uop',
      yearsOfWork: 20,
      monthlyIncome: 6000,
    },
  ],
  retirementAge: 65,
  claimMonth: 18,  // 12 months delay (will be capped at 12)
};
```

## Contract Type Contribution Bases

| Contract Type | Monthly Income | Contribution Base | Annual Contribution (19.52%) |
|---------------|----------------|-------------------|------------------------------|
| UoP           | 5,000 PLN      | 5,000 PLN        | 11,712 PLN                  |
| JDG           | 5,000 PLN      | 3,000 PLN (60%)  | 7,027 PLN                   |
| JDG Ryczałt   | 5,000 PLN      | 1,500 PLN (30%)  | 3,514 PLN                   |
| No Contribution| 0 PLN         | 0 PLN            | 0 PLN ✅                     |

## Result Structure

```typescript
interface ComposeCareerResult {
  scenario: {
    retirementAge: number;
    retirementYear: number;
    claimMonth: number;
    gender: 'M' | 'F';
    totalWorkYears: number;
  };
  monthlyPensionNominal: number;      // Future value
  monthlyPensionRealToday: number;    // Present value
  replacementRate: number;             // As decimal (0.07 = 7%)
  capitalTrajectory: Array<{
    year: number;
    annualWage: number;
    annualContribution: number;
    cumulativeCapital: number;
  }>;
  periodBreakdown: Array<{
    contractType: ContractType;
    years: number;
    avgIncome: number;
    totalContributions: number;
  }>;
  finalization: {
    quarterUsed: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    finalCapital: number;
  };
}
```

## Testing

Run the test script:
```bash
# Against local server
API_URL=http://localhost:3000/api node test-step5-fix.js

# Or use the built-in test
pnpm --filter @zus/core test
```
