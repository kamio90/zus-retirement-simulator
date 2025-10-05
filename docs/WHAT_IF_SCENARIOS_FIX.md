# What-If Scenarios Fix Documentation

## Issue Summary
The "Scenariusze co jeśli" (What-If Scenarios) feature on the Step 4a Results page was not working. When users clicked on scenario cards (early retirement, delay +12 months, delay +24 months), the displayed values did not change.

## Root Cause
In `apps/web/src/components/wizard/Step4aResult.tsx`, a flag `USE_MOCK_RESULT = true` was hardcoded, forcing the component to always use mock data instead of actual API results.

```typescript
// OLD CODE (BROKEN)
const USE_MOCK_RESULT = true;
const apiResult = USE_MOCK_RESULT
  ? null
  : (currentResult || (quickCalcResult as ScenarioResult | null));
```

This meant that even when what-if scenarios were calculated by the API and stored in `currentResult`, they were never displayed because `apiResult` was always `null`.

## Solution
Removed the `USE_MOCK_RESULT` flag and changed the code to use API results directly:

```typescript
// NEW CODE (FIXED)
// Use API result (from current what-if scenario or baseline quick calc)
const apiResult = currentResult || (quickCalcResult as ScenarioResult | null);
```

## Files Changed
1. **apps/web/src/components/wizard/Step4aResult.tsx** - Main fix: removed USE_MOCK_RESULT flag
2. **apps/web/src/components/wizard/BeaverCoach.tsx** - Prettier formatting
3. **apps/web/src/components/wizard/ExplainOverlay.tsx** - Prettier formatting
4. **apps/web/src/components/wizard/Step3aJdgDetails.tsx** - Prettier formatting
5. **apps/web/src/components/wizard/WizardLayout.tsx** - Prettier formatting
6. **apps/web/src/services/v2-api.ts** - Prettier formatting
7. **apps/web/src/utils/validation.ts** - Prettier formatting

## Testing Results

### ✅ Early Retirement Scenario (wcześniejsza emerytura o 5 lat)
- Pension decreases by ~39-45%
- Retirement year changes from 2060 to 2055
- Shows yellow warning banner about early retirement eligibility
- "Zastosowano" badge appears on the card

### ✅ Delay +12 Months Scenario (opóźnienie o 12 miesięcy)
- Pension increases by ~10-13%
- Retirement year changes from 2060 to 2061 Q2
- Delta indicators show green upward arrows
- "Zastosowano" badge appears on the card

### ✅ Delay +24 Months Scenario (opóźnienie o 24 miesiące)
- Pension increases by ~22-27%
- Retirement year changes from 2060 to 2062 Q2
- Delta indicators show green upward arrows
- "Zastosowano" badge appears on the card

### ✅ Restore Baseline
- "← Powrót do bazowego wyniku" button appears when scenario is applied
- Clicking it restores original baseline values
- Delta indicators disappear
- "Zastosowano" badges are removed

## How It Works

### Data Flow
1. User fills in wizard steps 1-3 (gender, age, contract type, income)
2. Step 4a displays baseline result from quick calculation
3. Baseline is stored in `baselineResult` state
4. Current displayed result is stored in `currentResult` state

### What-If Interaction
1. User clicks a what-if scenario card (e.g., "Opóźnij +12 miesięcy")
2. `handleWhatIf()` is called with the scenario parameters
3. API endpoint `/v2/compare/what-if` is called with:
   - `baselineContext`: Current user inputs (gender, age, income, etc.)
   - `items`: Array with scenario (e.g., `[{ kind: 'delay_months', months: 12 }]`)
4. API returns both baseline and variant results
5. Variant result is stored in `currentResult` state
6. Component re-renders with new values showing deltas from baseline

### Caching
- What-if results are cached in `whatIfCache` to avoid redundant API calls
- Cache stores up to 3 most recent scenarios
- When user clicks the same scenario again, cached result is used

## Visual Indicators

### When Scenario is Applied
- KPI tiles show new values with delta badges (↑/↓ with percentage)
- Chart updates to show new capital trajectory
- Scenario label appears below chart (e.g., "Scenariusz: delay_12m")
- "Zastosowano" badge on active scenario card
- Green ring highlights active scenario card
- "Przywróć wynik bazowy" button appears at top

### Delta Indicators
- **Green ↑**: Increase from baseline
- **Red ↓**: Decrease from baseline
- Shows percentage change (e.g., "↑ 12.5%")

## API Integration

### Endpoint
`POST /v2/compare/what-if`

### Request Format
```json
{
  "baselineContext": {
    "gender": "M",
    "age": 30,
    "contract": "JDG",
    "monthlyIncome": 5000,
    "isRyczalt": false
  },
  "items": [
    {
      "kind": "delay_months",
      "months": 12
    }
  ]
}
```

### Response Format
```json
{
  "baseline": { /* ScenarioResult */ },
  "variants": [
    { /* ScenarioResult with modified values */ }
  ]
}
```

## Screenshots
Screenshots documenting the working functionality are available in:
- `docs/screenshots/what-if-scenarios-baseline.png` - Baseline without scenarios
- `docs/screenshots/what-if-scenarios-delay-24m.png` - Delay +24 months applied
- `docs/screenshots/what-if-scenarios-early-retirement.png` - Early retirement applied

## Future Improvements
1. Add more what-if scenarios (e.g., contribution boost, higher ZUS base)
2. Allow combining multiple scenarios
3. Add comparison view to see all scenarios side-by-side
4. Export what-if results to PDF/Excel reports
