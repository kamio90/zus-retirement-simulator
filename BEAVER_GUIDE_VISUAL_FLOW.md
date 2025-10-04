# Beaver Educational Guide - Visual Flow Diagram

**Note:** As of v0.3, the FUN/FORMAL tone toggle has been removed. All content uses a friendly tone by default.

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
│  │  │  ┌──────┐  ┌──┐  ┌──┐  ┌──┐                   │    │  │
│  │  │  │Title │  │🔇│  │⚙️│  │×│                    │    │  │
│  │  │  └──────┘  └──┘  └──┘  └──┘                   │    │  │
│  │  │           Voice Settings  Close               │    │  │
│  │  └────────────────────────────────────────────────┘    │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────┐    │  │
│  │  │  Knowledge Card (from API)                     │    │  │
│  │  │                                                │    │  │
│  │  │  📚 Title: "System zdefiniowanej składki"    │    │  │
│  │  │                                                │    │  │
│  │  │  Short: "ZUS jak skarbonka..." (friendly)    │    │  │
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
GET /content/knowledge?step=step1_gender_age&lang=pl-PL&limit=1

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
                    │  - limit             │
                    │  (tone ignored)      │
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

## Content Tone

**Note:** As of v0.3, tone toggle has been removed. All content uses a friendly, educational style.

### Friendly Content Style
```
Content shows:
- Short: "ZUS jak skarbonka — co wrzucisz, to kiedyś wyjmiesz."
- Beaver Pose: "idea" (lightbulb)
- Friendly, educational language
```

## Step-to-Topic Mapping

| Wizard Step | Topics Available |
|-------------|-----------------|
| step1_gender_age | • Defined-contribution system<br>• Life expectancy (SDŻ) |
| step2_contract | • Women & men differences<br>• Contribution rates |
| step3a_jdg | • Initial capital<br>• Very low pensions |
| step4a_result | • Valorization<br>• Minimum pension |
| refine_compare | • Bridging pensions<br>• Multi-country (EU)<br>• PUE calculator |

## Content Examples

### Topic: Minimum Pension

**Friendly Tone:**
> "Nawet jeśli mało nazbierałeś, jest dolna granica — pod warunkiem stażu. Coś jak 'wersja demo' emerytury, ale pomaga."

### Topic: Multi-country Pensions

**Friendly Tone:**
> "Pracowałeś po EU? ZUS dogaduje się z innymi krajami — międzynarodowa koalicja emerytalna."

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

The Beaver Coach state is persisted in `localStorage`:

```typescript
// Storage key: 'beaver-preferences'
{
  state: {
    isMinimized: false,    // Coach minimize state
    lastStepId: null       // Last viewed step
  },
  version: 0
}
```

**Note:** As of v0.3, tone preference has been removed from storage.

## Integration Points

### 1. BeaverCoach Component
- Displays educational content header
- Shows TTS and voice controls
- Close button for minimizing

### 2. KnowledgeCard Component
- No tone parameter needed
- Displays friendly educational content
- Automatically fetches from API

### 3. API Controller
- Ignores tone parameter (backwards compatible)
- Returns friendly content by default
- Resolves tokens in response
- Returns cached response with ETag
- Adds X-Content-Tone: friendly header

## Supported Languages

| Language | Code | Topics | Status |
|----------|------|--------|--------|
| Polish | pl-PL | 10 topics | ✅ Complete |
| English | en-GB | 10 topics | ✅ Complete |

## Testing Checklist

- [x] Polish content loads correctly
- [x] English content loads correctly
- [x] Tone parameter is ignored (backwards compatible)
- [x] Tokens are resolved correctly
- [x] ETag caching works
- [x] TypeScript compiles without errors
- [x] Build completes successfully
- [x] No tone toggle in UI

## Future Enhancements

The following features are planned for future iterations:

1. **Layout Integration**
   - Desktop: Left rail sticky panel (320px width)
   - Mobile: Bottom sheet with drag handle

2. **Collision Detection**
   - Auto-minimize when CTAs are nearby
   - 24px proximity zone detection

3. **Dynamic Poses**
   - Context-based beaver poses (idea, wave, celebrate, etc.)

4. **Carousel Navigation**
   - Swipe through multiple tips per step
   - Arrow navigation for multiple knowledge items

5. **Analytics**
   - Monitor minimize/expand events
   - Measure knowledge engagement
