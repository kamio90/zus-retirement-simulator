/**
 * Consolidated Zod schemas for all DTOs
 * All schemas are exact (strip unknown keys) and shared by API middleware and frontend validation
 */

// Re-export all schemas for centralized access
export {
  SimulateRequestSchema,
  SimulationResultSchema,
  SimulateInputSchema,
  type SimulateRequest,
  type SimulationResult,
  type SimulateInput,
} from './simulate.dto';

export {
  ReportPayloadSchema,
  ReportPdfInputSchema,
  ReportXlsInputSchema,
  ReportPdfResponseSchema,
  ReportXlsResponseSchema,
  type ReportPayload,
  type ReportPdfInput,
  type ReportXlsInput,
  type ReportPdfResponse,
  type ReportXlsResponse,
} from './report.dto';

export {
  BenchmarksQuerySchema,
  BenchmarksResponseSchema,
  type BenchmarksQuery,
  type BenchmarksResponse,
} from './benchmarks.dto';

export {
  TelemetryEventSchema,
  SimulateSuccessEventSchema,
  DownloadPdfEventSchema,
  DownloadXlsEventSchema,
  DashboardOpenEventSchema,
  FormValidationFailedEventSchema,
  type TelemetryEvent,
  type TelemetryEventType,
  type SimulateSuccessEvent,
  type DownloadPdfEvent,
  type DownloadXlsEvent,
  type DashboardOpenEvent,
  type FormValidationFailedEvent,
} from './telemetry.dto';

export { ApiErrorSchema, type ApiError, type ErrorCode, ERROR_HTTP_MAPPING } from './errors';
