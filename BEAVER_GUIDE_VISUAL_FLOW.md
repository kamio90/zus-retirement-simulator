# Beaver Educational Guide - Visual Flow Diagram

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              BeaverCoach Component                       │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────┐    │  │
│  │  │  Header Row                                    │    │  │
│  │  │  ┌──────┐  ┌──────────────┐  ┌──┐  ┌──┐      │    │  │
│  │  │  │Title │  │ [FUN|FORMAL] │  │🔇│  │⚙️│  │—│ │    │  │
│  │  │  └──────┘  └──────────────┘  └──┘  └──┘  └──┘│    │  │
│  │  │           Tone Toggle    Voice   Settings Min │    │  │
│  │  └────────────────────────────────────────────────┘    │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────┐    │  │
│  │  │  Knowledge Card (from API)                     │    │  │
│  │  │                                                │    │  │
│  │  │  📚 Title: "System zdefiniowanej składki"    │    │  │
│  │  │                                                │    │  │
│  │  │  Short: "ZUS jak skarbonka..." (FUN)         │    │  │
│  │  │    OR                                          │    │  │
│  │  │  Short: "Od 1999 r. emerytura..." (FORMAL)   │    │  │
│  │  │                                                │    │  │
│  │  │  Source: ZUS – system ↗                       │    │  │
│  │  └────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Beaver Store    │
                    │  (Zustand)       │
                    │                  │
                    │  - tone: 'fun'   │
                    │  - isMinimized   │
                    │  - lastStepId    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  useKnowledge()  │
                    │  Hook            │
                    └──────────────────┘
                              │
                              ▼
```

## API Request Flow

```
GET /content/knowledge?step=step1_gender_age&lang=pl-PL&tone=fun&limit=1

                    ┌──────────────────────┐
                    │  Content Controller  │
                    └──────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  Load JSON File      │
                    │  knowledge.pl-PL.json│
                    └──────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  Filter by:          │
                    │  - step              │
                    │  - tone              │
                    │  - limit             │
                    └──────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  Resolve Tokens      │
                    │  {{MIN_PENSION}} →   │
                    │  "1780,96 PLN"       │
                    └──────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  Calculate ETag      │
                    │  Set Cache Headers   │
                    └──────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  Return JSON         │
                    │  Response            │
                    └──────────────────────┘
```

## Data Structure Comparison

### Before (Old Schema)
```json
{
  "id": "skladka-emerytalna",
  "step": "step2_contract",
  "title": "Składka emerytalna",
  "body": "Składka na ubezpieczenie...",
  "source": {
    "title": "ZUS - Składki",
    "url": "https://..."
  },
  "lang": "pl-PL"
}
```

### After (New Schema)
```json
{
  "id": "defined-contribution",
  "step": "step1_gender_age",
  "title": "System zdefiniowanej składki",
  "tone": "fun",                        // ⭐ NEW
  "short": "ZUS jak skarbonka...",      // ⭐ NEW
  "body": "ZUS działa jak skarbonka...",
  "pose": "idea",                        // ⭐ NEW
  "icon": "account_balance",             // ⭐ NEW
  "tokens": [],                          // ⭐ NEW
  "source": {
    "title": "ZUS – system",
    "url": "https://..."
  },
  "lang": "pl-PL"
}
```

## Tone Toggle UI States

### FUN Mode (Active)
```
┌──────────────────┐
│ [FUN] | FORMAL  │  ← FUN has green background
└──────────────────┘

Content shows:
- Short: "ZUS jak skarbonka — co wrzucisz, to kiedyś wyjmiesz."
- Beaver Pose: "idea" (lightbulb)
- Playful, friendly language
```

### FORMAL Mode (Active)
```
┌──────────────────┐
│  FUN | [FORMAL] │  ← FORMAL has green background
└──────────────────┘

Content shows:
- Short: "Od 1999 r. emerytura = suma zwaloryzowanych składek."
- Beaver Pose: "read" (reading document)
- Neutral, official language
```

## Step-to-Topic Mapping

| Wizard Step | Topics Available |
|-------------|-----------------|
| step1_gender_age | • Defined-contribution system<br>• Life expectancy (SDŻ) |
| step2_contract | • Women & men differences<br>• Contribution rates |
| step3a_jdg | • Initial capital<br>• Very low pensions |
| step4a_result | • Valorization<br>• Minimum pension |
| refine_compare | • Bridging pensions<br>• Multi-country (EU)<br>• PUE calculator |

## Content Tone Examples

### Topic: Minimum Pension

**FUN Tone:**
> "Nawet jeśli mało nazbierałeś, jest dolna granica — pod warunkiem stażu. Coś jak 'wersja demo' emerytury, ale pomaga."

**FORMAL Tone:**
> "Jeżeli spełnione są ustawowe okresy składkowe, przyznawana jest emerytura minimalna niezależnie od niskiego naliczenia."

### Topic: Multi-country Pensions

**FUN Tone:**
> "Pracowałeś po EU? ZUS dogaduje się z innymi krajami — międzynarodowa koalicja emerytalna."

**FORMAL Tone:**
> "Okresy ubezpieczenia z różnych państw UE agregowane są na mocy przepisów koordynacyjnych; ZUS współpracuje z zagranicznymi instytucjami."

## Token Resolution System

Available tokens and their resolved values:

```typescript
const TOKEN_VALUES = {
  MIN_PENSION: '1780,96 PLN',
  CONTRIBUTION_RATE: '19,52%',
  RETIREMENT_AGE_M: '65 lat',
  RETIREMENT_AGE_F: '60 lat',
};
```

**Example:**
```
Input:  "Emerytura minimalna wynosi {{MIN_PENSION}}."
Output: "Emerytura minimalna wynosi 1780,96 PLN."
```

## State Persistence

The tone preference is persisted in `localStorage`:

```typescript
// Storage key: 'beaver-preferences'
{
  state: {
    tone: 'fun',           // User's selected tone
    isMinimized: false,    // Coach minimize state
    lastStepId: null       // Last viewed step
  },
  version: 0
}
```

When user toggles tone, it:
1. Updates Zustand store
2. Saves to localStorage
3. Triggers re-fetch of knowledge with new tone
4. Updates all KnowledgeCard components

## Integration Points

### 1. BeaverCoach Component
- Displays tone toggle in header
- Reads tone from store
- Persists changes to localStorage

### 2. KnowledgeCard Component
- Reads tone from store via `useBeaverStore()`
- Passes tone to `useKnowledge()` hook
- Automatically updates when tone changes

### 3. API Controller
- Validates tone parameter
- Filters items by tone
- Resolves tokens in response
- Returns cached response with ETag

## Supported Languages

| Language | Code | Topics | Status |
|----------|------|--------|--------|
| Polish | pl-PL | 10 × 2 tones | ✅ Complete |
| English | en-GB | 10 × 2 tones | ✅ Complete |

## Testing Checklist

- [x] Polish FUN content loads correctly
- [x] Polish FORMAL content loads correctly
- [x] English FUN content loads correctly
- [x] English FORMAL content loads correctly
- [x] Tone toggle switches content
- [x] Tone preference persists across sessions
- [x] Tokens are resolved correctly
- [x] ETag caching works
- [x] TypeScript compiles without errors
- [x] Build completes successfully

## Future Enhancements

The following features are planned for future iterations:

1. **Layout Integration**
   - Desktop: Left rail sticky panel (320px width)
   - Mobile: Bottom sheet with drag handle

2. **Collision Detection**
   - Auto-minimize when CTAs are nearby
   - 24px proximity zone detection

3. **Dynamic Poses**
   - FUN tone → wave, idea, celebrate poses
   - FORMAL tone → read, point-left poses

4. **Carousel Navigation**
   - Swipe through multiple tips per step
   - Arrow navigation for multiple knowledge items

5. **Analytics**
   - Track tone changes
   - Monitor minimize/expand events
   - Measure knowledge engagement
