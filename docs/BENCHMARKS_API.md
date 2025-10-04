# Benchmarks API Implementation Summary

## Overview
Implemented complete Benchmarks API endpoints providing national and regional (powiat) pension averages for the ZUS Retirement Simulator dashboard.

## Data Source
- **File**: `data/pkt 6_emerytury_powiaty.xlsx` (December 2024 data)
- **Districts**: 380 powiaty across Poland
- **Metrics**: Average pension amounts by gender (male/female)

## National Averages (PLN/month)
- **Overall**: 3,713.32
- **Male**: 4,381.00
- **Female**: 3,045.65

## API Endpoints

### `GET /api/benchmarks`

Returns national and optional regional pension benchmarks.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `powiatTeryt` | string | No | 7-digit TERYT code of the powiat |
| `gender` | enum | No | Gender filter: `M` (male) or `F` (female) |

#### Response Schema
```typescript
{
  nationalAvgPension: number;        // National average pension
  powiatAvgPension?: number;         // Regional average (if powiatTeryt provided)
  powiatResolved?: {                 // Powiat info (if found)
    name: string;                    // e.g., "powiat aleksandrowski"
    teryt: string;                   // e.g., "0401000"
  };
  generatedAt: string;               // ISO 8601 timestamp
}
```

#### Examples

**1. National Average (Overall)**
```bash
GET /benchmarks

Response:
{
  "nationalAvgPension": 3713.32,
  "generatedAt": "2025-10-04T16:01:35.250Z"
}
```

**2. Gender-Filtered National Average**
```bash
GET /benchmarks?gender=M

Response:
{
  "nationalAvgPension": 4381,
  "generatedAt": "2025-10-04T16:01:35.259Z"
}
```

**3. Regional Benchmark (Powiat)**
```bash
GET /benchmarks?powiatTeryt=0401000

Response:
{
  "nationalAvgPension": 3713.32,
  "powiatAvgPension": 3439.865,
  "powiatResolved": {
    "name": "powiat aleksandrowski",
    "teryt": "0401000"
  },
  "generatedAt": "2025-10-04T16:01:35.267Z"
}
```

**4. Regional + Gender Filter**
```bash
GET /benchmarks?powiatTeryt=0401000&gender=M

Response:
{
  "nationalAvgPension": 4381,
  "powiatAvgPension": 3864.93,
  "powiatResolved": {
    "name": "powiat aleksandrowski",
    "teryt": "0401000"
  },
  "generatedAt": "2025-10-04T16:01:35.273Z"
}
```

## Architecture

### Layer Structure
```
apps/api/
├── controllers/benchmarksController.ts  # Request validation & response formatting
└── services/benchmarksService.ts        # Orchestration layer

packages/core/
└── src/benchmarks.ts                    # Core calculation logic

packages/data/
├── src/powiaty.ts                       # Data loading utilities
└── src/json/powiaty.json               # Converted Excel data

packages/types/
└── src/benchmarks.dto.ts               # Zod schemas & TypeScript types
```

## TERYT Code Format

TERYT codes are 7-digit identifiers:
- **Positions 1-2**: Województwo (voivodeship)
- **Positions 3-4**: Powiat (district)
- **Positions 5-6**: Gmina (municipality) - `00` for powiat-level
- **Position 7**: Type marker - `0` for powiat-level

Example: `0401000`
- `04` = województwo kujawsko-pomorskie
- `01` = powiat aleksandrowski
- `000` = powiat-level aggregate

## Testing

### Integration Tests
Script: `tools/scripts/test-benchmarks-api.sh`

**Test Coverage** (8 tests, all passing ✅):
1. National average (overall)
2. National average (male)
3. National average (female)
4. Powiat data lookup
5. Powiat + gender filter
6. Invalid TERYT validation
7. Invalid gender validation
8. Non-existent powiat handling

### Run Tests
```bash
# Start API server
cd apps/api
pnpm dev

# Run integration tests
./tools/scripts/test-benchmarks-api.sh
```

## Data Conversion

### Script: `tools/scripts/convert-powiaty-data.py`

Converts Excel file to JSON format:
```bash
python tools/scripts/convert-powiaty-data.py
```

## Files Created/Modified

### New Files
- ✨ `packages/data/src/powiaty.ts` - Data types and loaders
- ✨ `packages/data/src/json/powiaty.json` - 380 powiat records
- ✨ `packages/core/src/benchmarks.ts` - Core calculation logic
- ✨ `tools/scripts/convert-powiaty-data.py` - Excel to JSON converter
- ✨ `tools/scripts/test-benchmarks-api.sh` - Integration test suite

### Modified Files
- 📝 `apps/api/src/services/benchmarksService.ts` - Full implementation
- 📝 `apps/api/src/controllers/benchmarksController.ts` - Validation & error handling
- 📝 `apps/api/README.md` - API documentation

## Build & Deploy

```bash
# Build all packages
pnpm --filter ./packages/data build
pnpm --filter ./packages/core build
pnpm --filter ./apps/api build
```

## Usage in Dashboard

```typescript
// Fetch benchmarks for user's location and gender
const benchmarks = await fetch(
  `/api/benchmarks?powiatTeryt=${userTeryt}&gender=${userGender}`
).then(r => r.json());

// Compare with user's simulation
const percentOfNational = (userPension / benchmarks.nationalAvgPension) * 100;
```

---

**Status**: ✅ Complete and Ready for Production  
**Version**: 1.0.0  
**Priority**: P1 (Unblocks Dashboard)
