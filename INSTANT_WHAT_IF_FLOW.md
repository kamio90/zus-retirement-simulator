# Instant What-If Feature Flow

## User Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Step 4a: Result Page                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  KPI Grid (Baseline)                                      │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │  │
│  │  │Nominal   │ │Real      │ │Replace   │ │Year/Q    │    │  │
│  │  │3,500 PLN │ │2,800 PLN │ │58%       │ │2053 Q3   │    │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Capital Trajectory Chart                                 │  │
│  │  [Green line showing capital accumulation over time]      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  What-If Scenarios                                        │  │
│  │                                                            │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │  │
│  │  │  EARLY -5y  │ │  DELAY +12m │ │  DELAY +24m │        │  │
│  │  │  (YELLOW)   │ │  (GREEN)    │ │  (GREEN)    │        │  │
│  │  │  Click →    │ │  Click →    │ │  Click →    │        │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    User Clicks "DELAY +12m"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   INSTANT WHAT-IF UPDATE                        │
│                   (No Page Navigation)                          │
│                                                                 │
│  1. Check LRU Cache                                            │
│     └─ Cache Hit? → Use cached result                          │
│     └─ Cache Miss? → Call API                                  │
│                                                                 │
│  2. Show Skeleton Loaders                                      │
│     └─ KPI cards: animate-pulse                                │
│     └─ Chart: animate-pulse                                    │
│                                                                 │
│  3. API Call: POST /api/v2/compare/what-if                     │
│     {                                                           │
│       baselineContext: {...},                                  │
│       items: [{ kind: "delay_months", months: 12 }]           │
│     }                                                           │
│                                                                 │
│  4. Update State                                               │
│     └─ currentResult = whatIfResult                            │
│     └─ appliedWhatIf = "delay_12m"                             │
│     └─ Cache result in LRU                                     │
│                                                                 │
│  5. Render Updates                                             │
│     └─ KPIs with delta badges                                  │
│     └─ Chart with blue line                                    │
│     └─ "Back to baseline" button                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Updated Result View                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [← Back to baseline]                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  KPI Grid (What-If Applied)                               │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │  │
│  │  │Nominal   │ │Real      │ │Replace   │ │Year/Q    │    │  │
│  │  │3,700 PLN │ │2,950 PLN │ │61%       │ │2054 Q3   │    │  │
│  │  │↑ +5.7%   │ │↑ +5.4%   │ │↑ +5.2%   │ │          │    │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Capital Trajectory Chart                                 │  │
│  │  [Blue line showing adjusted capital]                     │  │
│  │  Scenario: delay_12m                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  What-If Scenarios                                        │  │
│  │                                                            │  │
│  │  ┌─────────────┐ ┌─────────────────┐ ┌─────────────┐    │  │
│  │  │  EARLY -5y  │ │  DELAY +12m     │ │  DELAY +24m │    │  │
│  │  │  (YELLOW)   │ │  (GREEN)        │ │  (GREEN)    │    │  │
│  │  │  Click →    │ │  ✓ APPLIED      │ │  Click →    │    │  │
│  │  └─────────────┘ └─────────────────┘ └─────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## State Management

```typescript
// Result Store (Zustand)
{
  baselineResult: ScenarioResult;      // Original calculation
  currentResult: ScenarioResult;       // Currently displayed (baseline or what-if)
  appliedWhatIf: string | null;        // e.g., "delay_12m", "early_retirement_5y"
  whatIfCache: [                       // LRU cache (max 3 entries)
    { key: "delay_12m", result: {...}, timestamp: ... },
    { key: "delay_24m", result: {...}, timestamp: ... },
    { key: "early_retirement_5y", result: {...}, timestamp: ... }
  ],
  isLoadingWhatIf: boolean;
  whatIfError: string | null;
}
```

## Delta Calculation

```typescript
// Calculate delta from baseline
const delta = calculateDelta(current, baseline);
// Returns: { value: +200, percent: +5.7 }

// Render delta badge
{delta && (
  <div className={delta.value > 0 ? 'text-green-600' : 'text-red-600'}>
    {delta.value > 0 ? '↑' : '↓'} {Math.abs(delta.percent).toFixed(1)}%
  </div>
)}
```

## Early Retirement Styling (Issue 4)

```typescript
// Yellow warning card
<div className="bg-yellow-50 border-2 border-yellow-400">
  <h4 className="text-yellow-900">
    Emerytura pomostowa (wcześniejsza)
  </h4>
  <p className="text-yellow-800">
    Dostępna tylko dla określonych zawodów
  </p>
</div>

// Disclaimer banner when applied
{appliedWhatIf === 'early_retirement_5y' && (
  <div className="bg-yellow-50 border-2 border-yellow-300">
    <p>ℹ️ Informacja o emeryturze pomostowej</p>
    <p>Emerytura pomostowa jest dostępna tylko dla osób...</p>
    <a href="https://www.zus.pl/..." target="_blank" rel="noopener">
      Dowiedz się więcej
    </a>
  </div>
)}
```

## Cache Strategy

```typescript
// LRU Cache (Last Recently Used)
// Max size: 3 entries per baseline
// Key format: "{kind}_{params}" (e.g., "delay_12m", "early_retirement_5y")

cacheWhatIfResult(key, result) {
  const newCache = [
    { key, result, timestamp: Date.now() },
    ...whatIfCache.filter(e => e.key !== key)
  ].slice(0, 3);  // Keep only 3 most recent
}

// Cache lookup on card click
const cached = getCachedWhatIf("delay_12m");
if (cached) {
  // Instant update, no API call
  setCurrentResult(cached);
} else {
  // Fetch from API
  const result = await compareWhatIf(...);
  cacheWhatIfResult("delay_12m", result);
}
```

## Accessibility

- `aria-live="polite"` on KPI grid for updates
- Screen reader announces: "Scenario updated"
- Skeleton loaders provide visual feedback
- Keyboard navigation supported (Enter/Space to activate)
- Focus states visible on all interactive elements
- External link with `rel="noopener noreferrer"`

## Performance

- **Cache Hit**: < 50ms (instant state update)
- **Cache Miss**: ~200-300ms (API call + render)
- **Max 3 API calls** per session (with 3 what-if cards)
- **Debounced animations** for reduced-motion users
