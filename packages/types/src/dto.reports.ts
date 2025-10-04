// DTOs for POST /api/report/pdf|xls
// -------------------------------------------------------------
// PDF/XLS input payload:
//   input: SimulateRequest
//   result: SimulationResult
//   chartImages?: { capitalTrajectoryBase64?: string; comparisonsBase64?: string }
//   branding?: { appName: string; primaryHex: string }
//
// PDF/XLS response: binary stream, metadata for content-disposition
