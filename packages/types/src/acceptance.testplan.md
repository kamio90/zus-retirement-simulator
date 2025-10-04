# Acceptance Test Plan — ZUS Types Package

## Build & Type Safety
- [ ] Package builds with strict TypeScript (no implicit any, no default exports)
- [ ] All DTOs and schemas are named exports only
- [ ] All branded types and enums are opaque and not interchangeable

## Schema Validation
- [ ] All schemas are exact (strip unknown keys)
- [ ] SimulateRequestSchema enforces cross-field logic (retirementAge, entitlementYear, chronological checks)
- [ ] SimulationResultSchema enforces currency non-negativity, replacementRate bounds, trajectory length
- [ ] Error envelope is uniform and covers all endpoints

## API & UI Integration
- [ ] Schemas are isomorphic (usable in API middleware and frontend validation)
- [ ] Barrel export provides all contracts for API/Core/Web

## No Business Logic
- [ ] No math or calculation logic present
