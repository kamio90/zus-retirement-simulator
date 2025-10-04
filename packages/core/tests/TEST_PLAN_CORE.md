# Test Plan — ZUS Pension Engine

## Strategy
- Unit, integration, property-based, metamorphic, boundary, negative/error tests
- Pure engine, deterministic providers, no I/O

## Environment
- Engine and providers are pure functions
- No file access, no randomness

## Pass/Fail Criteria
- All functional rules, edge cases, numeric policies covered
- All error states mapped to error envelope
- Coverage: every pipeline step, boundary, and negative case
