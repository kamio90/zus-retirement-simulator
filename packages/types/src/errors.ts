// Error envelope & codes for all endpoints
// -------------------------------------------------------------
// ApiError shape:
//   code: "VALIDATION_ERROR" | "DOMAIN_CONSTRAINT" | "NOT_FOUND" | "INTERNAL_ERROR"
//   message: string
//   details?: Record<string, unknown>
//   correlationId: string
//   hint?: string
// HTTP mapping guidance:
//   400 → validation failures
//   422 → domain infeasible
//   404 → missing benchmark resource
//   500 → unexpected
