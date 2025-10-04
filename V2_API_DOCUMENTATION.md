# V2 Wizard API Documentation

## Overview

The V2 Wizard API provides step-by-step pension calculation endpoints designed for a wizard-style user interface. It implements canonical ZUS pension calculation rules with deterministic, auditable results.

## Base URL

```
http://localhost:4000/v2
```

## Authentication

Currently no authentication required (demo mode).

## Common Headers

- `Content-Type: application/json`
- `X-Correlation-Id: <optional-string>` - Client-provided correlation ID for request tracking

## Response Format

All successful responses return JSON. All endpoints include `X-Correlation-Id` in response headers.

## Error Format

Errors follow a standardized envelope:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Input validation failed",
  "details": {
    "issues": [
      {
        "path": "monthlyIncome",
        "message": "Number must be between 0 and 1000000"
      }
    ]
  },
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "hint": "Check all required fields: gender, age, contract, monthlyIncome, isRyczalt"
}
```

### Error Codes

- `VALIDATION_ERROR` (400) - Request validation failed
- `DOMAIN_ERROR` (422) - Business logic constraint violated
- `INTERNAL_ERROR` (500) - Server error

---

## Endpoints

### 1. POST /v2/wizard/init

**Purpose**: Step 1 - Validate gender and age (stateless)

**Request Body**:
```json
{
  "gender": "M",
  "age": 35
}
```

**Response**:
```json
{
  "ok": true
}
```

**Validation**:
- `gender`: Must be "M" or "F"
- `age`: Integer between 18 and 100

---

### 2. POST /v2/wizard/contract

**Purpose**: Step 2 - Validate contract type (stateless)

**Request Body**:
```json
{
  "contract": "JDG"
}
```

**Response**:
```json
{
  "ok": true
}
```

**Validation**:
- `contract`: Must be "UOP", "JDG", or "JDG_RYCZALT"

---

### 3. POST /v2/wizard/jdg

**Purpose**: Step 3a - JDG Quick Result (immediate pension preview)

**Request Body**:
```json
{
  "gender": "M",
  "age": 35,
  "contract": "JDG",
  "monthlyIncome": 12000,
  "isRyczalt": false,
  "claimMonth": 6
}
```

**Response** (ScenarioResult):
```json
{
  "kpi": {
    "monthlyNominal": 5123.45,
    "monthlyRealToday": 3410.12,
    "replacementRate": 0.52,
    "retirementYear": 2060,
    "claimQuarter": "Q2"
  },
  "capitalTrajectory": [
    {
      "year": 2026,
      "capital": 12345.67
    },
    {
      "year": 2027,
      "capital": 26012.89
    }
  ],
  "assumptions": {
    "providerKind": "DeterministicDemo",
    "annualIndexSetId": "DEMO_ANNUAL",
    "quarterlyIndexSetId": "DEMO_QUARTERLY",
    "lifeTableId": "SDZ.2060.M",
    "wageVintageId": "DEMO_WAGE",
    "cpiVintageId": "DEMO_CPI",
    "contribRuleId": "CONTRIB.DEMO"
  },
  "explainers": [
    "Quarter mapping: claimMonth 6 → Q2",
    "SDŻ table window: SDZ.2060.M",
    "Annual valorization precedes quarterly in final year",
    "Initial capital special index: not applied"
  ]
}
```

**Validation**:
- `gender`: "M" or "F"
- `age`: Integer 18-100
- `contract`: "UOP", "JDG", or "JDG_RYCZALT"
- `monthlyIncome`: Number 0-1,000,000
- `isRyczalt`: Boolean
- `claimMonth`: Optional integer 1-12 (default: 6)

**Quarter Mapping**:
- Months 1-3 → Q1
- Months 4-6 → Q2
- Months 7-9 → Q3
- Months 10-12 → Q4

---

### 4. POST /v2/compare/higher-zus

**Purpose**: Compare pension with higher ZUS contribution base

**Request Body**:
```json
{
  "gender": "M",
  "age": 35,
  "contract": "JDG",
  "monthlyIncome": 12000,
  "isRyczalt": false,
  "claimMonth": 6,
  "zusMultiplier": 1.5
}
```

**Response**: ScenarioResult (same as /v2/wizard/jdg)

**Validation**:
- Same as `/v2/wizard/jdg` plus:
- `zusMultiplier`: Optional number 1-3 (default: 1.5)

**Behavior**: Calculates pension with `monthlyIncome * zusMultiplier`

---

### 5. POST /v2/compare/as-uop

**Purpose**: Compare pension as if working under UoP contract

**Request Body**:
```json
{
  "gender": "M",
  "age": 35,
  "contract": "JDG",
  "monthlyIncome": 12000,
  "isRyczalt": false,
  "claimMonth": 6
}
```

**Response**: ScenarioResult

**Behavior**: Forces UoP contract type for calculation

---

### 6. POST /v2/compare/what-if

**Purpose**: Calculate multiple refinement scenarios

**Request Body**:
```json
{
  "baselineContext": {
    "gender": "M",
    "age": 35,
    "contract": "JDG",
    "monthlyIncome": 12000,
    "isRyczalt": false,
    "claimMonth": 6
  },
  "items": [
    {
      "kind": "contribution_boost",
      "monthly": 1000,
      "label": "Add 1000 PLN monthly"
    },
    {
      "kind": "delay_retirement",
      "years": 2,
      "label": "Work 2 more years"
    }
  ]
}
```

**Response**:
```json
{
  "baseline": {
    // ScenarioResult
  },
  "variants": [
    {
      // ScenarioResult for first refinement
    },
    {
      // ScenarioResult for second refinement
    }
  ]
}
```

**Refinement Item Types**:
- `contribution_boost`: Increase monthly contribution by `monthly` PLN
- `delay_retirement`: Delay retirement by `years` years
- `higher_base`: Increase base by `monthly` percent

**Validation**:
- `items`: Array of 1-5 refinement items

---

### 7. POST /v2/simulate

**Purpose**: Final comprehensive simulation with baseline and optional variants

**Request Body**:
```json
{
  "baselineContext": {
    "gender": "M",
    "age": 35,
    "contract": "JDG",
    "monthlyIncome": 12000,
    "isRyczalt": false,
    "claimMonth": 6
  },
  "variants": [
    {
      "kind": "contribution_boost",
      "monthly": 1000
    }
  ]
}
```

**Response**:
```json
{
  "baselineResult": {
    // ScenarioResult
  },
  "variants": [
    {
      // ScenarioResult for variant
    }
  ]
}
```

**Validation**:
- `variants`: Optional array of up to 10 refinement items

---

## Canonical Algorithm Notes

The v2 API implements the canonical ZUS pension calculation algorithm:

### Quarter Mapping (SPEC_ENGINE.md Section E)

The quarterly valorization mapping is:
- **Q1 (Jan-Mar)** → Uses Q3 of **previous year**
- **Q2 (Apr-Jun)** → Uses Q4 of **previous year**
- **Q3 (Jul-Sep)** → Uses Q1 of **current year**
- **Q4 (Oct-Dec)** → Uses Q2 of **current year**

### Calculation Steps

1. **Annual Contributions**: Wage × 19.52% × absenceFactor
2. **Annual Valorization**: Applied on 1 June using index for previous year
3. **Quarterly Valorization**: After last 31 Jan, quarterly indices applied
4. **Initial Capital**: Special 1999 index (1.1560) applied once if provided
5. **SDŻ Window**: 1 Apr → 31 Mar for life expectancy table selection
6. **Pension Calculation**:
   - Nominal = capital / (SDŻ_years × 12)
   - Real = nominal / CPI_discount
   - Replacement = real / currentGrossMonthly

### Contract Types & Contribution Base

- **UOP**: 100% of gross salary
- **JDG**: max(declared, MIN_BASE) - simplified as 60% of income
- **JDG_RYCZALT**: from parameter table - simplified as min(30% of income, 4500 PLN)

### Deterministic Properties

1. **Real ≤ Nominal** under inflation (CPI > 1)
2. **Monotonicity**: Higher income → Higher pension (both nominal and real)
3. **Idempotence**: Same input → Same output
4. **Assumptions populated**: All IDs present in response

---

## Usage Examples

### TypeScript Client

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:4000/v2';

async function calculateJdgPension() {
  const response = await axios.post(`${API_BASE}/wizard/jdg`, {
    gender: 'M',
    age: 35,
    contract: 'JDG',
    monthlyIncome: 12000,
    isRyczalt: false,
    claimMonth: 6,
  });

  console.log('Monthly pension (nominal):', response.data.kpi.monthlyNominal);
  console.log('Monthly pension (real):', response.data.kpi.monthlyRealToday);
  console.log('Replacement rate:', response.data.kpi.replacementRate);
}
```

### cURL Examples

```bash
# Step 1: Init
curl -X POST http://localhost:4000/v2/wizard/init \
  -H "Content-Type: application/json" \
  -d '{"gender": "M", "age": 35}'

# Step 2: Contract
curl -X POST http://localhost:4000/v2/wizard/contract \
  -H "Content-Type: application/json" \
  -d '{"contract": "JDG"}'

# Step 3a: JDG Quick Result
curl -X POST http://localhost:4000/v2/wizard/jdg \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "M",
    "age": 35,
    "contract": "JDG",
    "monthlyIncome": 12000,
    "isRyczalt": false,
    "claimMonth": 6
  }'

# Compare: Higher ZUS
curl -X POST http://localhost:4000/v2/compare/higher-zus \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "M",
    "age": 35,
    "contract": "JDG",
    "monthlyIncome": 12000,
    "isRyczalt": false,
    "claimMonth": 6,
    "zusMultiplier": 1.5
  }'

# Final Simulate
curl -X POST http://localhost:4000/v2/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "baselineContext": {
      "gender": "M",
      "age": 35,
      "contract": "JDG",
      "monthlyIncome": 12000,
      "isRyczalt": false,
      "claimMonth": 6
    },
    "variants": [
      {"kind": "contribution_boost", "monthly": 1000},
      {"kind": "delay_retirement", "years": 2}
    ]
  }'
```

---

## Performance

- **Target p95 Latency**: < 300ms (with demo providers)
- **Caching**: LRU cache planned for baseline scenarios
- **Concurrency**: Stateless design supports horizontal scaling

---

## Migration from V1

The v2 API replaces the following v1 endpoints:

- `POST /simulate` → Use `POST /v2/simulate`
- `POST /scenarios/jdg-quick` → Use `POST /v2/wizard/jdg`
- `POST /scenarios/compose` → Use `POST /v2/simulate` with variants

Key differences:
- Uppercase contract types (UOP vs uop)
- ScenarioResult structure with deterministic IDs
- Quarter mapping in KPI response
- Explainers array for transparency

---

## Testing

### Manual Testing

Use the provided cURL commands above or Postman/Insomnia.

### Automated Testing

Property tests verify:
- Real ≤ Nominal under inflation
- Monotonicity (higher income → higher pension)
- Quarter mapping correctness (all 4 quarters)
- Deterministic assumptions IDs

---

## Troubleshooting

### Common Errors

1. **VALIDATION_ERROR on age**
   - Ensure age is between 18 and 100
   
2. **VALIDATION_ERROR on contract**
   - Use uppercase: "UOP", "JDG", or "JDG_RYCZALT"
   
3. **High pension values**
   - Demo providers use aggressive growth rates for testing
   - Real production data will yield realistic values

### Correlation IDs

Always include `X-Correlation-Id` header for request tracking:

```bash
curl -H "X-Correlation-Id: my-session-123" \
  -X POST http://localhost:4000/v2/wizard/jdg \
  -d '{...}'
```

The correlation ID appears in error responses and server logs.

---

## Next Steps

- [ ] Add LRU caching for performance
- [ ] Implement real parameter providers (XLSX data)
- [ ] Add telemetry and monitoring
- [ ] OpenAPI/Swagger documentation
- [ ] Rate limiting for production
