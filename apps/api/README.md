# ZUS Retirement Simulator API

Express + TypeScript backend scaffold

## Scripts

- `pnpm dev` — Start in development mode
- `pnpm build` — Compile TypeScript
- `pnpm start` — Run compiled server
- `pnpm test` — Run tests (placeholder)

## Endpoints

### `/healthcheck` — Health status
Simple health check endpoint.

### `/simulate` — Pension simulation
Calculate pension based on user input parameters.

### `/scenarios` — Scenario Engine v2 (NEW)
Step-by-step pension calculations for wizard UI with instant previews and comparisons.

**See [SCENARIO_API_v2.md](../../SCENARIO_API_v2.md) for complete documentation.**

#### `POST /scenarios/jdg-quick`
Fast JDG (self-employment) pension preview for wizard step 3→4.

#### `POST /scenarios/compose`
Multi-period career composition with different contract types (UoP/JDG/Ryczałt).

#### `POST /scenarios/compare`
Compare scenarios: UoP vs JDG, higher ZUS contributions, delayed retirement.

### `/reports` — Export reports
Generate and export pension reports (PDF/XLS).

#### `POST /reports/pdf`
Generate a PDF report from simulation results.

**Request Body:**
- `input`: Original simulation input parameters
- `result`: Simulation result data
- `branding` (optional): Customization options

**Response:** PDF file download

#### `POST /reports/xls`
Generate an Excel (XLSX) report from simulation results.

**Request Body:**
- `input`: Original simulation input parameters
- `result`: Simulation result data
- `branding` (optional): Customization options

**Response:** XLSX file download

**XLS Structure:**
- **Summary Sheet**: Key results, scenario details, assumptions
- **Capital Trajectory Sheet**: Year-by-year breakdown of wages, contributions, and accumulated capital

### `/benchmarks` — National & Powiat pension averages
Get benchmark pension data for Poland nationally and by powiat (district).

**Query Parameters:**
- `powiatTeryt` (optional): 7-digit TERYT code of the powiat
- `gender` (optional): Gender filter - `M` (male) or `F` (female)

**Examples:**
```bash
# Get national average (overall)
GET /benchmarks
# Response: { "nationalAvgPension": 3713.32, "generatedAt": "..." }

# Get national average for males
GET /benchmarks?gender=M
# Response: { "nationalAvgPension": 4381.00, "generatedAt": "..." }

# Get national and powiat average
GET /benchmarks?powiatTeryt=0401000
# Response: {
#   "nationalAvgPension": 3713.32,
#   "powiatAvgPension": 3439.87,
#   "powiatResolved": { "name": "powiat aleksandrowski", "teryt": "0401000" },
#   "generatedAt": "..."
# }

# Get gender-specific data for a powiat
GET /benchmarks?powiatTeryt=0401000&gender=M
# Response: {
#   "nationalAvgPension": 4381.00,
#   "powiatAvgPension": 3864.93,
#   "powiatResolved": { "name": "powiat aleksandrowski", "teryt": "0401000" },
#   "generatedAt": "..."
# }
```

**Data Source:** `pkt 6_emerytury_powiaty.xlsx` (December 2024)

### `/telemetry` — Usage telemetry
Collect usage statistics and analytics.

**Event Types:**
- `simulate_success` — Successful pension simulation
- `download_pdf` — PDF report downloaded
- `download_xls` — Excel report downloaded
- `dashboard_open` — Dashboard/results page opened
- `form_validation_failed` — Form validation errors

**Request Body (all events):**
```json
{
  "eventType": "simulate_success",
  "timestampISO": "2025-01-15T14:30:00.000Z",
  "correlationId": "unique-session-id",
  "userAgentHash": "hashed-user-agent",
  "payloadLite": {
    "retirementAge": 67,
    "workYears": 40
  }
}
```

**Privacy & Storage:**
- Events stored in memory (mock implementation)
- No PII collected
- Limited to last 10,000 events
- Hash user agent for privacy

### `/admin` — Admin telemetry exports

#### `GET /admin/telemetry/stats`
Get telemetry statistics summary.

**Response:**
```json
{
  "totalEvents": 150,
  "eventTypeCounts": {
    "simulate_success": 80,
    "download_pdf": 30,
    "download_xls": 20,
    "dashboard_open": 15,
    "form_validation_failed": 5
  },
  "oldestEvent": "2025-01-15T10:00:00.000Z",
  "newestEvent": "2025-01-15T16:00:00.000Z"
}
```

#### `GET /admin/telemetry/export?format={jsonl|csv}`
Export all telemetry events in JSONL or CSV format.

**Query Parameters:**
- `format` — Export format: `jsonl` (default) or `csv`

**JSONL Format** (Content-Type: `application/x-ndjson`):
```jsonl
{"eventType":"simulate_success","timestampISO":"2025-01-15T14:30:00.000Z",...}
{"eventType":"download_pdf","timestampISO":"2025-01-15T14:35:00.000Z",...}
```

**CSV Format** (Content-Type: `text/csv`):
```csv
eventType,timestampISO,correlationId,userAgentHash,payloadLite
simulate_success,2025-01-15T14:30:00.000Z,session-123,hash-abc,"{""retirementAge"":67}"
download_pdf,2025-01-15T14:35:00.000Z,session-124,hash-def,{}
```

**Examples:**
```bash
# Get telemetry statistics
GET /admin/telemetry/stats

# Export as JSONL (default)
GET /admin/telemetry/export
GET /admin/telemetry/export?format=jsonl

# Export as CSV
GET /admin/telemetry/export?format=csv
```

## Logging
Logs are written to `apps/api/logs/access.log`.

## Environment
See root `.env.example` for required variables.
