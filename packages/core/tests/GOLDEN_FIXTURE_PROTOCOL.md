# Golden Fixture Protocol

## Summary
Brief protocol for golden test fixtures in the ZUS Pension Engine.

## Core Principles

- Express expectations **structurally**: lengths, ID sequences, order, monotonic properties
- Ratio/ordering checks: scenario B ≥ scenario A
- Symbolic IDs: `ANNUAL.Y{year}`, `QTR.Q{n}.{PREV|CURR}`, `SDZ.{year}.{M|F}`
- **No exact numeric values** (demo providers use unrealistic multipliers)
- Future extension: numeric golden snapshots under versioned directory (`golden/v2025-Q1/`)

## Quick Reference

### Structural Validation
✅ Trajectory length  
✅ ID format patterns  
✅ Monotonicity checks  
✅ Bounds validation (min/max)  
✅ Explainer presence  
✅ Comparative relationships  

### NOT Validated (Demo Phase)
❌ Exact pension amounts  
❌ Specific numeric values  
❌ Precise replacement rates  

## See Also

For comprehensive documentation, see:
- **[GOLDEN_FIXTURE_PLAN.md](./GOLDEN_FIXTURE_PLAN.md)** - Complete fixture strategy, schemas, and implementation guide
- **[TEST_BLUEPRINT.md](./TEST_BLUEPRINT.md)** - Overall test architecture
- **[TEST_IMPLEMENTATION_GUIDE.md](./TEST_IMPLEMENTATION_GUIDE.md)** - Practical patterns and examples
