# V2 Wizard API - Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ZUS Retirement Simulator                     │
│                    V2 Wizard API Implementation                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Step 1: Gender & Age                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  • Store gender and age in wizardStore                   │   │
│  │  • No API call (stateless validation)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│  Step 2: Contract Type                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  • Select: UOP / JDG / JDG_RYCZALT                       │   │
│  │  • Store in wizardStore                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│  Step 3a: JDG Details                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  • Input monthly income                                  │   │
│  │  • Select ryczałt option                                 │   │
│  │  • On "Oblicz szybko":                                   │   │
│  │    POST /v2/wizard/jdg → ScenarioResult                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│  Step 4a: Quick Result                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  KPIs:                                                   │   │
│  │  • Monthly Nominal: 5,123 PLN                           │   │
│  │  • Monthly Real (today): 3,410 PLN                      │   │
│  │  • Replacement Rate: 52%                                │   │
│  │  • Retirement: 2060 Q2                                  │   │
│  │                                                          │   │
│  │  Capital Trajectory Chart:                              │   │
│  │  [Year-by-year growth visualization]                    │   │
│  │                                                          │   │
│  │  CTA Cards:                                              │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │   │
│  │  │ Higher ZUS  │ │  As UoP     │ │ Refine &    │      │   │
│  │  │  📈         │ │  💼         │ │ Compare 🎯  │      │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

                              ↕ HTTP/JSON

┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express + TypeScript)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  V2 Routes (/v2/*)                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  POST /wizard/init          → wizardInit()              │   │
│  │  POST /wizard/contract      → wizardContract()          │   │
│  │  POST /wizard/jdg          → wizardJdg()               │   │
│  │  POST /compare/higher-zus  → compareHigherZus()        │   │
│  │  POST /compare/as-uop      → compareAsUop()            │   │
│  │  POST /compare/what-if     → compareWhatIf()           │   │
│  │  POST /simulate            → simulateV2()              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│  V2 Wizard Service                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  • Map contract types (JDG → contribution base)         │   │
│  │  • Build EngineInput from wizard context                │   │
│  │  • Call Core Engine.calculate()                         │   │
│  │  • Transform EngineOutput → ScenarioResult              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│  V2 Wizard Controller                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  • Zod validation (WizardJdgRequestSchema)              │   │
│  │  • Correlation ID handling                              │   │
│  │  • Error envelope mapping                               │   │
│  │  • HTTP status codes (400/422/500)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

                              ↕

┌─────────────────────────────────────────────────────────────────┐
│                    CORE ENGINE (@zus/core)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Engine.calculate(input, providers) → EngineOutput              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  A. Entitlement Setup                                    │   │
│  │     • Compute retirement age (M: 65, F: 60)             │   │
│  │     • Determine entitlement year                        │   │
│  │     • Map claim month to quarter                        │   │
│  │                                                          │   │
│  │  B. Wage Projection                                      │   │
│  │     • Annual wage series from start to retirement       │   │
│  │     • Apply wage growth factors                         │   │
│  │                                                          │   │
│  │  C. Annual Contributions                                 │   │
│  │     • Contribution = wage × 19.52% × absenceFactor      │   │
│  │                                                          │   │
│  │  D. Annual Valorization                                  │   │
│  │     • Apply on 1 June for contributions by 31 Jan       │   │
│  │     • Use index for previous year                       │   │
│  │                                                          │   │
│  │  E. Quarterly Valorization                               │   │
│  │     • After last 31 Jan                                 │   │
│  │     • Quarter mapping:                                  │   │
│  │       Q1 → Q3 prev year                                │   │
│  │       Q2 → Q4 prev year                                │   │
│  │       Q3 → Q1 curr year                                │   │
│  │       Q4 → Q2 curr year                                │   │
│  │                                                          │   │
│  │  F. Initial Capital                                      │   │
│  │     • Special 1999 index (1.1560) on 1 Jun 2000        │   │
│  │     • Then annual valorization path                     │   │
│  │                                                          │   │
│  │  G. Life Expectancy                                      │   │
│  │     • SDŻ table window: 1 Apr → 31 Mar                 │   │
│  │                                                          │   │
│  │  H. Pension Calculation                                  │   │
│  │     • Nominal = capital / (SDŻ × 12)                   │   │
│  │     • Real = nominal / CPI_discount                     │   │
│  │     • Replacement = real / currentGross                 │   │
│  │                                                          │   │
│  │  I. Build Output                                         │   │
│  │     • Capital trajectory                                │   │
│  │     • Assumptions with provider IDs                     │   │
│  │     • Explainers array                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ✅ Property Tests (All Passing)                                 │
│     • Real ≤ Nominal under inflation                            │
│     • Monotonicity: higher income → higher pension             │
│     • Quarter mapping for all 4 quarters                        │
│     • Idempotence: same input → same output                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SCENARIO RESULT SHAPE                       │
├─────────────────────────────────────────────────────────────────┤
│  {                                                                │
│    kpi: {                                                         │
│      monthlyNominal: number,                                      │
│      monthlyRealToday: number,                                    │
│      replacementRate: number,                                     │
│      retirementYear: number,                                      │
│      claimQuarter: "Q1"|"Q2"|"Q3"|"Q4"                           │
│    },                                                             │
│    capitalTrajectory: [                                           │
│      { year: number, capital: number }                            │
│    ],                                                             │
│    assumptions: {                                                 │
│      providerKind: "DeterministicDemo",                          │
│      annualIndexSetId: string,                                    │
│      quarterlyIndexSetId: string,                                 │
│      lifeTableId: string,                                         │
│      wageVintageId: string,                                       │
│      cpiVintageId: string,                                        │
│      contribRuleId: string                                        │
│    },                                                             │
│    explainers: [                                                  │
│      "Quarter mapping: claimMonth 6 → Q2",                       │
│      "SDŻ table window: SDZ.2060.M",                             │
│      "Annual valorization precedes quarterly in final year",     │
│      "Initial capital special index: not applied"                │
│    ]                                                              │
│  }                                                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      CONTRACT TYPE MAPPING                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  UOP (Employment Contract)                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Contribution Base = 100% of gross salary                │   │
│  │  Example: 8,000 PLN → base = 8,000 PLN                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  JDG (Self-Employment)                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Contribution Base = max(declared, MIN_BASE)             │   │
│  │  Simplified: 60% of income                               │   │
│  │  Example: 12,000 PLN → base = 7,200 PLN                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  JDG_RYCZALT (Lump-Sum Tax)                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Contribution Base = RYCZALT_BASE[year, threshold]       │   │
│  │  Simplified: min(30% of income, 4,500 PLN)               │   │
│  │  Example: 12,000 PLN → base = 3,600 PLN                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  All: Monthly Contribution = base × 19.52%                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         TESTING SUMMARY                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ✅ Core Engine Tests                                             │
│     Test Suites: 14 passed                                        │
│     Tests: 114 passed                                             │
│     Time: 4.257s                                                  │
│                                                                   │
│  ✅ V2 API Manual Tests                                           │
│     POST /v2/wizard/init          ✓                              │
│     POST /v2/wizard/contract      ✓                              │
│     POST /v2/wizard/jdg          ✓                              │
│     POST /v2/compare/higher-zus  ✓                              │
│     POST /v2/compare/as-uop      ✓                              │
│     POST /v2/compare/what-if     ✓                              │
│     POST /v2/simulate            ✓                              │
│                                                                   │
│  ✅ Build Verification                                            │
│     packages/types    ✓                                           │
│     packages/core     ✓                                           │
│     packages/data     ✓                                           │
│     apps/api          ✓                                           │
│     apps/web          ✓                                           │
│                                                                   │
│  ✅ Frontend Integration                                          │
│     Wizard uses v2 API            ✓                              │
│     Displays ScenarioResult       ✓                              │
│     Shows KPIs and trajectory     ✓                              │
│     Error handling with IDs       ✓                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      FILES CREATED/MODIFIED                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  NEW FILES                                                        │
│  • packages/types/src/v2-wizard.dto.ts                           │
│  • apps/api/src/services/v2WizardService.ts                      │
│  • apps/api/src/controllers/v2WizardController.ts                │
│  • apps/api/src/routes/v2.ts                                     │
│  • apps/web/src/services/v2-api.ts                               │
│  • V2_API_DOCUMENTATION.md                                        │
│  • IMPLEMENTATION_SUMMARY.md                                      │
│                                                                   │
│  MODIFIED FILES                                                   │
│  • packages/types/src/index.ts                                   │
│  • apps/api/src/index.ts                                         │
│  • apps/web/src/components/wizard/Wizard.tsx                     │
│  • apps/web/src/components/wizard/Step4aResult.tsx               │
│  • README.md                                                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```
