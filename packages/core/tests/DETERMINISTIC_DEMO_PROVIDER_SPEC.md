# Deterministic Demo Provider Spec

- Wage growth: smooth, strictly positive, geometric compounding
- CPI: strictly positive, baseline inflation
- Annual valorization: monotonic, chronological, distinct IDs
- Quarterly valorization: stable order, distinct IDs, correct mapping
- Initial capital: special 1999 index, then annual path
- All IDs symbolic (e.g., ANNUAL.Y-1, QTR.Q3.PREV)
- No randomness, no external files
- Guarantees: monotonicity, compounding, deterministic outputs
