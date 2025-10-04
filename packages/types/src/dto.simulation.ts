// DTOs for POST /api/simulate
// -------------------------------------------------------------
// SimulateRequest (input):
//   birthYear: Year
//   gender: Gender
//   startWorkYear: Year
//   currentGrossMonthly: CurrencyPLN
//   retirementAge?: number (default by gender)
//   accumulatedInitialCapital?: CurrencyPLN
//   subAccountBalance?: CurrencyPLN
//   absenceFactor?: Percent (default 1.0)
//   claimMonth?: Month (default 6)
//   powiatTeryt?: TerytCode
//
// Validation semantics:
//   - Disallow unknown fields
//   - Cross-field checks: entitlementYear, chronological consistency
//
// SimulationResult (output):
//   scenario: { retirementAge, retirementYear, claimMonth, gender }
//   monthlyPensionNominal: CurrencyPLN
//   monthlyPensionRealToday: CurrencyPLN
//   replacementRate: number (0..1)
//   capitalTrajectory: TrajectoryRowVO[]
//   finalization: FinalizationVO
//   assumptions: AssumptionsVO
//   explainers: string[]
