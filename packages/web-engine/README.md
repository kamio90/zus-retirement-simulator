# Web Engine (Frontend Fallback)

**Status:** Placeholder / Future Implementation

## Purpose

This package will provide a frontend-only calculation engine that mirrors the canonical backend algorithm. It will allow the application to compute pension scenarios when the backend API is unavailable or returns errors.

## Planned Features

- **Canonical Algorithm**: Mirror the backend calculation exactly
  - Annual valorization on June 1st using previous year's index
  - Quarterly valorization for contributions after last Jan 31
  - Initial capital 1999 × 1.1560 with annual valorization
  - SDŻ (life expectancy) window: April 1 - March 31
  - CPI discount for real values
  - Replacement rate calculation

- **Provider Bundle**: Use same demo providers as backend for consistency
- **Deterministic**: Produce identical results to backend for same inputs
- **Lightweight**: Bundle size optimized for web delivery
- **Type-safe**: Full TypeScript support with shared DTOs from @zus/types

## Integration

When implemented, the web engine will be used as a fallback:

```typescript
// In Step5RefineCompare.tsx
import { calculatePension } from '@zus/web-engine';

try {
  // Try API first
  const result = await simulateV2(request, corrId);
  setComputeResult(result);
} catch (error) {
  // Fallback to frontend engine
  const feResult = calculatePension(request.baselineContext);
  setComputeResult({
    baselineResult: feResult,
    variants: [],
    engineProvider: 'frontend' // Mark as computed locally
  });
  // Show banner: "Computed locally (offline mode)"
}
```

## Feature Flag

Control with environment variable:
```
VITE_FE_ENGINE_FALLBACK=true
```

## Current Status

This package is a **placeholder** for future implementation. The structure and contracts are defined, but the actual calculation logic is not yet implemented.

For MVP v0.3, we rely on the backend API with improved error messaging. Future iterations will add the frontend fallback capability.

## Implementation Plan

1. Extract core calculation functions from `@zus/core`
2. Bundle demo providers for web use
3. Create lightweight engine wrapper
4. Add integration in Step5RefineCompare
5. Test determinism against backend
6. Add offline capability banner
