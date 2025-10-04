# Test Cases — Initial Capital

| Case ID | Scenario | Expected Index Application | Alignment | Error Cases | Acceptance |
|---------|----------|---------------------------|-----------|-------------|------------|
| CORE-INITCAP-001 | With initial capital | 1999 index first, then annual | matches contribution path | missing index | correct order |
| CORE-INITCAP-002 | Without initial capital | no index applied | n/a | n/a | correct skip |
| CORE-INITCAP-003 | Double application | error | n/a | double apply | error envelope |
| CORE-INITCAP-004 | Wrong year mapping | error | n/a | wrong year | error envelope |
