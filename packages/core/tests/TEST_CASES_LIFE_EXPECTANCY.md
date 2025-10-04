# Test Cases — Life Expectancy (SDŻ)

| Case ID | Gender | Claim Date | Table Window | Expected Table ID | Denominator | Acceptance |
|---------|--------|-----------|--------------|------------------|-------------|------------|
| CORE-SDZ-001 | M | 1 Apr | 1 Apr–31 Mar | correct table | years × 12 | correct selection |
| CORE-SDZ-002 | F | 31 Mar | 1 Apr–31 Mar | correct table | years × 12 | correct selection |
| CORE-SDZ-003 | M/F | boundary | window logic | correct table | > 0 | windowing works |
| CORE-SDZ-004 | M/F | invalid date | error | n/a | error envelope |
