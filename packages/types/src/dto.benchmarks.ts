// DTOs for GET /api/benchmarks
// -------------------------------------------------------------
// BenchmarksQuery: { powiat?: TerytCode | string }
// BenchmarksResponse: {
//   nationalAvgPension: CurrencyPLN
//   powiatAvgPension?: CurrencyPLN
//   powiatResolved?: { name: string; teryt: TerytCode }
// }
// Empty/unknown powiat yields only national average
