# Domain Assertions & Error Mapping

- Age bounds; chronological consistency (startWorkYear ≤ entitlementYear)
- AbsenceFactor within provider bounds
- Providers must supply indices for all required years/quarters
- Real ≤ nominal unless macro provider flags deflation
- Map each violation to error codes from `packages/types/errors.ts`
