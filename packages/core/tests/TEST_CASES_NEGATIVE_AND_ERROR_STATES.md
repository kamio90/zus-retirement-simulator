# Test Cases — Negative & Error States

| Case ID | Scenario | Error Condition | Expected Envelope | Acceptance |
|---------|----------|----------------|------------------|------------|
| CORE-ERR-001 | Chronology | startWorkYear > entitlementYear | 422 | correct error |
| CORE-ERR-002 | Absence bounds | absenceFactor out of bounds | 400 | correct error |
| CORE-ERR-003 | Missing index | index for year/quarter not found | 422 | correct error |
| CORE-ERR-004 | Life table missing | SDŻ not found | 404 | correct error |
| CORE-ERR-005 | Real > nominal | inflation path violated | 500 + anomaly | anomaly flagged |
