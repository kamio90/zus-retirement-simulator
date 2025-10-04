# v2 Flow Implementation - Beaver Educator 2.0

## Overview
This document summarizes the implementation of the v2-only wizard flow with Beaver Educator 2.0, blue "Worth Knowing" cards, contract logic fixes, and working final compute button.

## Changes Implemented

### 1. Backend (API)

#### Contract Validation
- **File**: `apps/api/src/services/v2WizardService.ts`
- **Change**: Added validation to reject `UOP + ryczałt` combinations
- **Error**: Returns `INTERNAL_ERROR` with message "Invalid combination: UOP contract cannot use ryczałt taxation"
- **Applied in**:
  - `wizardJdg()` function
  - `simulateV2()` function

### 2. Frontend - Core Infrastructure

#### v2-only Routing
- **File**: `apps/web/src/App.tsx`
- **Change**: 
  - Added redirect from `/simulate` → `/wizard`
  - Imported `Navigate` from react-router-dom
  - All v1 routes now redirect to v2 wizard

#### InfoCard Component
- **File**: `apps/web/src/components/wizard/InfoCard.tsx`
- **Features**:
  - Blue theme with brain icon (variant="knowledge")
  - Support for tip and warning variants
  - Expandable source attribution
  - Official ZUS/GOV source links
  - Responsive design
  - Reduced motion support

#### BeaverCoach v2.0
- **File**: `apps/web/src/components/wizard/BeaverCoach.tsx`
- **New Features**:
  - **Multiple poses**: idle, wave, point-left, point-right, think, read, typing, idea, warning, info-card, celebrate
  - **TTS (Text-to-Speech)**: Web Speech API integration with Polish language support
  - **Transcript toggle**: Show/hide message text
  - **Larger size**: 28x28 to 36x36 (mobile to desktop)
  - **Speaking state**: Visual feedback when TTS is active
  - **Emoji placeholders**: Using emojis until actual pose assets are added
- **Props**:
  - `pose?: BeaverPose` - Select beaver pose/animation
  - Existing props preserved (message, tone, ctaLabel, onCta)

### 3. Frontend - Contract Logic

#### Step 2: Contract Type
- **File**: `apps/web/src/components/wizard/Step2ContractType.tsx`
- **Changes**:
  - Added InfoCard with UoP vs JDG differences
  - Beaver pose: `point-left`

#### Step 3a: JDG Details
- **File**: `apps/web/src/components/wizard/Step3aJdgDetails.tsx`
- **Changes**:
  - Ryczałt checkbox **only shown for JDG** contracts (not UoP)
  - Added InfoCard explaining ryczałt (visible only when JDG + ryczałt selected)
  - Beaver pose: `read`
  - Contract type check: `isJdgContract = contractType === 'jdg' || contractType === 'jdg_ryczalt'`

#### Step 5: Refine & Compare
- **File**: `apps/web/src/components/wizard/Step5RefineCompare.tsx`
- **Changes**:
  - Contract dropdown filters out `jdg_ryczalt` option for UoP
  - Added `getAvailableContractTypes()` function
  - Beaver pose: `typing`

### 4. Frontend - Final Compute Button

#### Step 5: Final Simulation
- **File**: `apps/web/src/components/wizard/Step5RefineCompare.tsx`
- **Implementation**:
  - `handleComputePrecisePension()` async function
  - Calls `/api/v2/simulate` with baseline context
  - Shows loading state with spinner
  - Displays error banner with correlation ID on failure
  - Shows KPI results on success (nominal, real, replacement rate, retirement date)
  - Maps local contract types to API format (UOP, JDG, JDG_RYCZALT)

### 5. Content & Documentation

#### Official Sources
- **File**: `content/sources.md`
- **Contains**:
  - ZUS official URLs (zus.pl)
  - GOV.PL links (gov.pl/web/zus)
  - GUS life expectancy tables (stat.gov.pl)
  - Legal acts (isap.sejm.gov.pl)
  - Data source documentation

#### Worth Knowing Snippets
- **File**: `content/knowledge.json`
- **Items** (10 total):
  1. Annual valorization
  2. Quarterly valorization
  3. Initial capital
  4. Life expectancy tables (SDŻ)
  5. Contribution rate (19.52%)
  6. UoP vs JDG differences
  7. Ryczałt in JDG
  8. Career periods
  9. Replacement rate
  10. Claim quarter impact

### 6. Beaver Pose Mapping

| Step | Pose | Context |
|------|------|---------|
| Step 1 (Gender/Age) | `wave` | Welcome message |
| Step 2 (Contract) | `point-left` | Explaining contract types |
| Step 3a (JDG Details) | `read` | Reading income details |
| Step 4a (Results) | `celebrate` | Showing quick calc results |
| Step 5 (Refine) | `typing` | Adding career periods |
| Errors | `warning` | Error states (future) |
| InfoCards | `info-card` | Educational content (future) |

## Testing

### Manual Tests Performed
✅ Build succeeds without errors
✅ API validation rejects UOP + ryczałt
✅ API accepts JDG + ryczałt
✅ Routing redirects /simulate to /wizard
✅ InfoCard renders with blue theme
✅ BeaverCoach shows different poses
✅ TTS works (when browser supports it)
✅ Transcript toggle works
✅ Step3a hides ryczałt for UoP
✅ Step5 filters contract types correctly
✅ Final compute button calls /v2/simulate
✅ Error handling shows correlation ID

### Test Commands
```bash
# Start API
cd apps/api && pnpm run dev

# Test UOP + ryczałt (should fail)
curl -X POST http://localhost:4000/v2/wizard/jdg \
  -H "Content-Type: application/json" \
  -d '{"gender":"M","age":35,"contract":"UOP","monthlyIncome":5000,"isRyczalt":true}'

# Test JDG + ryczałt (should succeed)
curl -X POST http://localhost:4000/v2/wizard/jdg \
  -H "Content-Type: application/json" \
  -d '{"gender":"M","age":35,"contract":"JDG","monthlyIncome":5000,"isRyczalt":true}'
```

## Future Enhancements

### Beaver Assets
- Replace emoji placeholders with actual beaver PNG/SVG assets
- Create pose sprite sheet (1024px, transparent background)
- Store in `apps/web/public/assets/beaver/`

### TTS Improvements
- Voice selection (male/female)
- Rate and pitch controls
- Auto-play option (accessibility consideration)
- Persistent speaking state across navigations

### InfoCard Enhancements
- Create `/api/content/knowledge` endpoint
- Dynamic loading from backend
- More granular pose-to-content mapping
- Animated icons

### API v1 Deprecation
- Add 410 Gone responses to all v1 endpoints
- Log deprecation warnings
- Add migration guide

## Accessibility

✅ **ARIA labels**: All interactive elements properly labeled
✅ **Keyboard navigation**: Tab order, focus states, Enter/Space activation
✅ **Screen readers**: aria-live regions for Beaver messages
✅ **Reduced motion**: Respects `prefers-reduced-motion` media query
✅ **Color contrast**: Blue InfoCards meet WCAG 2.1 AA (4.5:1)
✅ **Focus indicators**: Visible focus rings on all interactive elements

## File Changes Summary

### Created
- `apps/web/src/components/wizard/InfoCard.tsx`
- `content/sources.md`
- `content/knowledge.json`

### Modified
- `apps/api/src/services/v2WizardService.ts`
- `apps/web/src/App.tsx`
- `apps/web/src/components/wizard/BeaverCoach.tsx`
- `apps/web/src/components/wizard/Step1GenderAge.tsx`
- `apps/web/src/components/wizard/Step2ContractType.tsx`
- `apps/web/src/components/wizard/Step3aJdgDetails.tsx`
- `apps/web/src/components/wizard/Step4aResult.tsx`
- `apps/web/src/components/wizard/Step5RefineCompare.tsx`
- `apps/web/src/components/wizard/index.ts`

## Build Output
```
✓ packages/data built
✓ packages/types built
✓ packages/ui built
✓ packages/core built
✓ apps/web built (805.60 kB)
✓ apps/api built
```

## Conclusion
All requirements from the epic have been successfully implemented:
- ✅ v2-only flow with routing
- ✅ Beaver Educator 2.0 (poses, TTS, transcript)
- ✅ Blue "Worth Knowing" InfoCards
- ✅ Contract logic fixes (no ryczałt on UoP)
- ✅ Working final compute button
- ✅ Official ZUS/GOV content sources
