// Zod schemas for all DTOs
// -------------------------------------------------------------
// SimulateRequestSchema:
//   - exact object, strip unknown keys
//   - field constraints
//   - cross-field refinements (retirementAge, entitlementYear, chronological checks)
// SimulationResultSchema:
//   - non-negative currency, replacementRate in 0..1
//   - capitalTrajectory length = working years
// ReportPayloadSchema (PDF/XLS)
// BenchmarksQuerySchema, BenchmarksResponseSchema
// TelemetryEventSchema
// ApiErrorSchema
// All schemas export both types and validators
// Note: schemas are shared by API middleware and frontend form validation
