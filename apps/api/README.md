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

### `/reports` — Export reports
Generate and export pension reports (PDF/XLS).

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

## Logging
Logs are written to `apps/api/logs/access.log`.

## Environment
See root `.env.example` for required variables.
