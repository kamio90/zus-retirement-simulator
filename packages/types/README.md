# ZUS Retirement Simulator — Types & Contracts

## Domain Glossary
- **Waloryzacja roczna/kwartalna**: Annual/quarterly valorization of pension capital
- **CPI discount**: Real value adjustment using Consumer Price Index
- **SDŻ window**: Life expectancy table window (April–March)
- **Initial capital**: Starting pension capital, valorized per ZUS rules

## DTOs & Schemas
- **SimulateRequest**: Input for pension simulation
- **SimulationResult**: Output of simulation
- **ReportPayload**: Input/output for PDF/XLS reports
- **BenchmarksQuery/Response**: Regional/national pension averages
- **TelemetryEvent**: Usage and analytics events
- **ApiError**: Uniform error envelope for all endpoints

## Error Policy & HTTP Mapping
- 400: Validation error
- 422: Domain constraint violation
- 404: Resource not found
- 500: Internal error

## Versioning
- Add `schemaVersion` to responses if needed for future compatibility

## Cross-link
- See upcoming actuarial specs: `SPEC_ACTUARIAL.md`, `SPEC_PARAMETERS.md`

## Acceptance Criteria
- Strict TypeScript (no any, no implicit)
- All schemas are exact/strict and shared (API + UI)
- Cross-field validation logic specified
- Error envelope is uniform and future-proof
- No business logic implemented here
