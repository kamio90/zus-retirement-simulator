# Test Cases — Contributions & Absence Factor

| Case ID | Scenario | Absence Factor | Expected Effect | Trajectory Row | Acceptance |
|---------|----------|---------------|----------------|---------------|------------|
| CORE-ABS-001 | Normal | within bounds | base decreases as absence↓ | all fields present | correct calculation |
| CORE-ABS-002 | Out of bounds | < min or > max | error | n/a | error envelope |
| CORE-ABS-003 | Sensitivity | wage path↑ | base increases | all fields present | monotonicity |
