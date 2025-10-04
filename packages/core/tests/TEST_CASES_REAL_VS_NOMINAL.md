# Test Cases — Real vs Nominal Pension

| Case ID | Scenario | CPI Path | Expected Relation | Acceptance |
|---------|----------|----------|------------------|------------|
| CORE-CPI-001 | Inflation | strictly positive | real ≤ nominal | correct discount |
| CORE-CPI-002 | Deflation | negative | real > nominal (flag anomaly) | anomaly flagged |
| CORE-CPI-003 | Zero inflation | flat | real = nominal | equality |
| CORE-CPI-004 | Rounding | n/a | deferred to presentation | reference rounding doc |
