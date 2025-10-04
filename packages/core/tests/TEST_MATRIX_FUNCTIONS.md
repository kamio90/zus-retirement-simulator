# Test Matrix — Engine Functions

| Function | Inputs | Preconditions | Expected Outputs | Invariants | Error Conditions | Properties |
|----------|--------|---------------|------------------|------------|-----------------|------------|
| deriveEntitlement | birthYear, gender, retirementAge, claimMonth | legal age, valid month | retirementYear, quarter | retirementYear ≥ startWorkYear | retirementAge out of bounds | deterministic, monotonic |
| projectAnnualWageSeries | startWorkYear, anchorYear, macro | valid years | YearlyWage[] | ≥ 0, chronological | missing macro factor | monotonic, geometric |
| computeAnnualContributions | wageSeries, contribRate, absenceFactor | valid rate, bounds | YearlyContribution[] | ≥ 0, same length | absenceFactor out of bounds | sensitivity, linearity |
| applyAnnualValorization | contribs, annualProvider | indices present | AnnualValorizedState[] | monotone capital | missing index | compounding, order |
| valorizeInitialCapital | initial, initialProvider, annualProvider | initial present | ValorizedInitialCapital | special 1999 index | missing index, double apply | alignment |
| applyQuarterlyValorization | lastAnnualState, quarterProvider, entitlementQuarter, claimDate | valid quarter | FinalizationStep | correct index IDs | missing index | compounding, mapping |
| composeBase | valorized states | all present | baseCapital | base ≥ sum | missing component | aggregation |
| selectLifeExpectancy | gender, claimDate, lifeProvider | valid gender/date | years, table ID | years > 0 | missing table | windowing |
| computeNominalMonthly | base, years | base ≥ 0, years > 0 | monthly | ≥ 0 | zero/negative | division |
| discountToReal | nominal, macro, claimDate, anchorYear | valid macro | real | real ≤ nominal | missing factor | monotonicity |
| computeReplacement | real, currentGrossMonthly | valid wage | replacement | 0 ≤ replacement ≤ 1.5 | zero/negative wage | ratio |
| buildOutput | all | valid inputs | EngineOutput | trajectory length, explainers | missing field | completeness |
