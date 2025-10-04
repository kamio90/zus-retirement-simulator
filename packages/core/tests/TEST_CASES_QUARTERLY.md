# Test Cases — Quarterly Valorization

| Case ID | Quarter | Claim Month | Expected Index Mapping | Compounding Order | Acceptance |
|---------|---------|------------|-----------------------|-------------------|------------|
| CORE-QUARTER-001 | Q1 | 4 | Q3 of previous year | annual then quarterly | correct index ID, order |
| CORE-QUARTER-002 | Q2 | 5 | Q4 of previous year | annual then quarterly | correct index ID, order |
| CORE-QUARTER-003 | Q3 | 8 | Q1 of current year | annual then quarterly | correct index ID, order |
| CORE-QUARTER-004 | Q4 | 11 | Q2 of current year | annual then quarterly | correct index ID, order |
| CORE-QUARTER-005 | Boundary | 3/4/5/6/7/8/9/10/11/12 | Mapping per rule | order per spec | all rules covered |
