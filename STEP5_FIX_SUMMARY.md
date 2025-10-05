# Step 5 Fix Summary - No Contribution Periods & Calculation Fix

## Issue
The issue requested two main fixes:
1. Fix the frontend calculation in Step 5 which was not calculating correctly
2. Add support for "okres bez składki" (periods without contributions)

## Changes Made

### 1. Added No-Contribution Period Support

#### Backend Changes
- **packages/types/src/scenarios.dto.ts**: Added `'no_contribution'` to `ContractType` enum
- **apps/api/src/services/scenariosService.ts**: Updated `getContributionBase()` function to handle `no_contribution` periods by returning 0 for contribution base

#### Frontend Changes
- **apps/web/src/store/wizardStore.ts**: Added `'no_contribution'` to `ContractType` type
- **apps/web/src/components/wizard/Step5RefineCompare.tsx**: 
  - Added "Okres bez składki" as a contract type option
  - Updated UI to disable income field when "no_contribution" is selected
  - Fixed average income calculation to exclude no-contribution periods
  - Updated period display to show "Brak składki" for no-contribution periods

### 2. Fixed Step 5 Calculations

#### API Integration Fix
Changed from using incorrect `simulateV2` API to the correct `composeCareer` API:
- **Before**: Used `simulateV2(request, correlationId)` which was not the right endpoint
- **After**: Uses `composeCareer(request)` which properly handles multi-period career calculations

#### Retirement Options Implementation
- Implemented early retirement checkbox (reduces retirement age by 5 years)
- Implemented retirement delay selector (adds months to claim month)
- Both options now properly update state and are used in the calculation

#### Result Display Fix
Updated result display to match `ComposeCareerResult` format:
- Changed from `computeResult.baselineResult.kpi.*` to `computeResult.*`
- Fixed field mapping for nominal pension, real pension, replacement rate, and retirement date
- Corrected quarter display format

### 3. Calculation Logic

The weighted average calculation for multi-period careers now properly handles:
1. **UoP (Umowa o pracę)**: 100% of income as contribution base
2. **JDG (Działalność)**: 60% of income as contribution base  
3. **JDG Ryczałt**: min(30% of income, 4500 PLN) as contribution base
4. **No Contribution**: 0 PLN contribution base (new!)

Formula:
```
weightedIncome = Σ(contributionBase_i × years_i)
avgContributionBase = weightedIncome / totalYears
```

Periods without contributions are included in total years but contribute 0 to the weighted income.

## Testing

### Build Verification
- ✅ Types package builds successfully
- ✅ API package builds successfully  
- ✅ Web app builds successfully
- ✅ Core tests pass (117/120 tests, 3 skipped)

### Code Verification
- Verified `no_contribution` case is present in compiled JavaScript
- Verified calculation logic handles 0 contribution base correctly
- Verified frontend properly integrates with backend API

## Example Usage

```typescript
const request: ComposeCareerRequest = {
  birthYear: 1990,
  gender: 'M',
  careerPeriods: [
    {
      contractType: 'uop',
      yearsOfWork: 10,
      monthlyIncome: 5000
    },
    {
      contractType: 'no_contribution',  // NEW!
      yearsOfWork: 2,
      monthlyIncome: 0
    },
    {
      contractType: 'jdg',
      yearsOfWork: 15,
      monthlyIncome: 8000
    }
  ],
  retirementAge: 65,
  claimMonth: 6
};
```

## Files Modified

1. `packages/types/src/scenarios.dto.ts` - Added no_contribution to ContractType
2. `apps/api/src/services/scenariosService.ts` - Added no_contribution handling
3. `apps/web/src/store/wizardStore.ts` - Updated ContractType
4. `apps/web/src/components/wizard/Step5RefineCompare.tsx` - Fixed API integration and added UI support

## UI Changes

### New Features
1. **"Okres bez składki" option** in contract type dropdown
2. **Disabled income field** when no-contribution is selected with helper text
3. **Early retirement checkbox** (-5 years) with description
4. **Retirement delay selector** (0, 12, 24 months) with description
5. **Corrected result display** showing proper pension calculations

### UX Improvements
- Income field automatically disables for no-contribution periods
- Average income calculation excludes periods without income
- Period breakdown clearly shows "Brak składki" for no-contribution periods
- Better error handling and user feedback
