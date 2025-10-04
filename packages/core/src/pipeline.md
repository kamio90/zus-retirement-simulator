# Engine Function Decomposition & Invariants

1. deriveEntitlement(input) → { retirementAge, retirementYear, claimMonth, quarter }
   - Invariants: retirementAge legal; entitlementYear ≥ startWorkYear; valid quarter
2. projectAnnualWageSeries(input, macro) → YearlyWage[]
   - Invariants: chronological; ≥ 0
3. computeAnnualContributions(wageSeries, contribRate, absenceFactor) → YearlyContribution[]
   - Invariants: same length; ≥ 0
4. applyAnnualValorization(contribs, annualProvider) → AnnualValorizedState[]
   - Invariants: monotone non-decreasing capital if indices ≥ 0
5. valorizeInitialCapital(initial, initialProvider, annualProvider) → ValorizedInitialCapital
   - Invariants: special 1999 index applied once
6. applyQuarterlyValorization(lastAnnualState, quarterProvider, entitlementQuarter, claimDate) → FinalizationStep
   - Invariants: annual then quarterly; correct index IDs
7. composeBase(...) → baseCapital
   - Invariants: base ≥ sum of components; IDs recorded
8. selectLifeExpectancy(gender, claimDate, lifeProvider) → years
   - Invariants: years > 0; table ID recorded
9. computeNominalMonthly(base, years) → number
   - Invariants: ≥ 0
10. discountToReal(nominal, macro, claimDate, anchorYear) → number
    - Invariants: real ≤ nominal unless deflation
11. computeReplacement(real, currentGrossMonthly) → number
    - Invariants: 0 ≤ replacement ≤ 1.5
12. buildOutput(...) → EngineOutput
    - Invariants: trajectory length = working years; IDs populated; explainers non-empty
