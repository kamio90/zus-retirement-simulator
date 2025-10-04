# ZUS Retirement Simulator — Pension Calculation Engine

## Principles
- Pure, deterministic, referentially transparent (no I/O, no randomness)
- Parameterized by provider interfaces (indices, macro, SDŻ, etc.)
- Compatible with DTOs and branded types from `packages/types`
- Supports both demo and official provider modes

## Usage
- Plug in a `ProviderBundle` (demo or official)
- Call `calculate(input, providers)` with validated input
- Engine guarantees: same input + same providers = same output
- No file access, logging, or side effects
