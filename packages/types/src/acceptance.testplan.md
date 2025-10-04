# Acceptance Test Plan — ZUS Types Package

## Build & Type Safety

- [x] Package builds with strict TypeScript (no implicit any, no default exports)
- [x] All DTOs and schemas are named exports only
- [x] All branded types and enums are opaque and not interchangeable

## Schema Validation

- [x] All schemas are exact (strip unknown keys)
- [x] SimulateRequestSchema enforces cross-field logic (retirementAge, entitlementYear, chronological checks)
- [x] SimulationResultSchema enforces currency non-negativity, replacementRate bounds, trajectory length
- [x] Error envelope is uniform and covers all endpoints

## API & UI Integration

- [x] Schemas are isomorphic (usable in API middleware and frontend validation)
- [x] Barrel export provides all contracts for API/Core/Web

## No Business Logic

- [x] No math or calculation logic present
