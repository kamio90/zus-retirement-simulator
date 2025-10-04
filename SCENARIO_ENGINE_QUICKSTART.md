# Scenario Engine v2 - Quick Start Guide

## What's New

The Scenario Engine v2 adds three powerful API endpoints specifically designed for the wizard UI, enabling:

- ⚡ **Instant pension previews** after each wizard step
- 🎯 **Multi-period career composition** with different contract types
- 📊 **Scenario comparisons** with actionable recommendations

## Quick Test

### 1. Start the API Server

```bash
cd apps/api
npm run dev
```

Server will start on `http://localhost:4000`

### 2. Run the Test Suite

```bash
# From repository root
./test-scenario-api.sh
```

Expected output:
```
✓ Retirement Age: 60
✓ Retirement Year: 2050
✓ Contribution Base: 1800 PLN
✓ All Tests Completed!
```

### 3. Test Individual Endpoints

#### JDG Quick Calculation
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

#### Career Composition
```bash
curl -X POST http://localhost:4000/scenarios/compose \
  -H "Content-Type: application/json" \
  -d '{
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
      }
    ]
  }'
```

#### Scenario Comparison
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

## Wizard Integration

The wizard automatically calls these APIs:

### Step 3 → Step 4: JDG Quick Calculation

When user clicks "Oblicz szybko" after entering JDG details:

```typescript
// apps/web/src/components/wizard/Wizard.tsx
const result = await calculateJdgQuick({
  birthYear: 1985,
  gender: 'M',
  age: 40,
  monthlyIncome: 8000,
  isRyczalt: false,
});

// Result displayed in Step4aResult
```

### Step 5: Career Composition

When user clicks "Oblicz dokładną emeryturę" with career periods:

```typescript
// Future integration in Step5RefineCompare.tsx
const result = await composeCareer({
  birthYear: 1985,
  gender: 'M',
  careerPeriods: [...],
});
```

## Contract Types Explained

### 1. UoP (Umowa o Pracę)
- **Full employment contract**
- Contribution base: 100% of salary
- Example: 8000 PLN salary → 8000 PLN contribution base

### 2. JDG (Jednoosobowa Działalność Gospodarcza)
- **Self-employment**
- Contribution base: ~60% of income
- Example: 8000 PLN income → 4800 PLN contribution base

### 3. JDG Ryczałt
- **Self-employment with lump-sum tax**
- Contribution base: minimum (~30% of income, max 4500 PLN)
- Example: 8000 PLN income → 2400 PLN contribution base

## Response Format

### JDG Quick Result
```json
{
  "scenario": {
    "retirementAge": 65,
    "retirementYear": 2050,
    "retirementQuarter": 2,
    "gender": "M"
  },
  "nominalPension": 3500,
  "realPension": 2800,
  "replacementRate": 0.58,
  "capitalTrajectory": [...],
  "assumptions": {
    "startWorkYear": 2007,
    "contributionBase": 4800,
    "contributionRate": 0.1952
  }
}
```

### Compose Career Result
```json
{
  "scenario": {
    "retirementAge": 67,
    "retirementYear": 2052,
    "totalWorkYears": 25
  },
  "monthlyPensionNominal": 4200,
  "monthlyPensionRealToday": 3100,
  "replacementRate": 0.52,
  "periodBreakdown": [
    {
      "contractType": "jdg",
      "years": 10,
      "avgIncome": 5000,
      "totalContributions": 58560
    }
  ]
}
```

### Comparison Result
```json
{
  "base": {
    "label": "JDG",
    "pension": 3500,
    "replacementRate": 0.58
  },
  "comparison": {
    "label": "Umowa o pracę (UoP)",
    "pension": 4200,
    "replacementRate": 0.65
  },
  "difference": {
    "absolute": 700,
    "percentage": 20.0
  },
  "recommendation": "Umowa o pracę może dać wyższą emeryturę..."
}
```

## Error Handling

All endpoints return standardized errors:

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
  "hint": "Check birthYear, gender, age..."
}
```

## Correlation IDs

Track requests across frontend and backend:

```bash
curl -H "X-Correlation-Id: my-session-123" \
  -X POST http://localhost:4000/scenarios/jdg-quick \
  -d '{...}'
```

The correlation ID is echoed in the response header and error objects.

## Troubleshooting

### API Server Not Starting
```bash
# Check port availability
lsof -i :4000

# Install dependencies
pnpm install

# Build first
pnpm --filter ./apps/api build
```

### TypeScript Errors
```bash
# Rebuild types package
pnpm --filter ./packages/types build

# Rebuild all
pnpm build
```

### Validation Errors
- Check request body matches schema
- Birth year must be 1940-2010
- Age must be 18-100
- Monthly income must be 0-1,000,000

## Documentation

- **API Docs**: `SCENARIO_API_v2.md` - Complete endpoint documentation
- **Architecture**: `SCENARIO_ENGINE_v2_SUMMARY.md` - Implementation overview
- **API README**: `apps/api/README.md` - General API information

## What's Next

To fully integrate with the wizard:

1. **Step 5 Integration**: Connect career periods to compose endpoint
2. **Comparison UI**: Add comparison cards to results page
3. **Export**: Add PDF/XLS export for scenario comparisons
4. **Caching**: Implement result caching for performance

## Support

For issues or questions:
- Check test script: `./test-scenario-api.sh`
- Review API docs: `SCENARIO_API_v2.md`
- Validate request schema in `packages/types/src/scenarios.dto.ts`

---

**Status**: ✅ Ready for HackYeah 2025 Demo

**Last Updated**: October 2025
