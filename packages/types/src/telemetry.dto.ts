/**
 * DTOs and schemas for POST /api/telemetry
 */
import { z } from 'zod';

export type TelemetryEventType =
  | 'simulate_success'
  | 'download_pdf'
  | 'download_xls'
  | 'dashboard_open'
  | 'form_validation_failed';

// Base telemetry event schema
const BaseTelemetryEventSchema = z.object({
  eventType: z.enum([
    'simulate_success',
    'download_pdf',
    'download_xls',
    'dashboard_open',
    'form_validation_failed',
  ]),
  timestampISO: z.string().datetime(),
  correlationId: z.string(),
  userAgentHash: z.string().optional(),
  payloadLite: z.record(z.unknown()).optional(),
});

// Specific event schemas
export const SimulateSuccessEventSchema = BaseTelemetryEventSchema.extend({
  eventType: z.literal('simulate_success'),
  payloadLite: z
    .object({
      retirementAge: z.number().optional(),
      workYears: z.number().optional(),
    })
    .optional(),
}).strict();

export const DownloadPdfEventSchema = BaseTelemetryEventSchema.extend({
  eventType: z.literal('download_pdf'),
}).strict();

export const DownloadXlsEventSchema = BaseTelemetryEventSchema.extend({
  eventType: z.literal('download_xls'),
}).strict();

export const DashboardOpenEventSchema = BaseTelemetryEventSchema.extend({
  eventType: z.literal('dashboard_open'),
}).strict();

export const FormValidationFailedEventSchema = BaseTelemetryEventSchema.extend({
  eventType: z.literal('form_validation_failed'),
  payloadLite: z
    .object({
      fieldErrors: z.array(z.string()).optional(),
    })
    .optional(),
}).strict();

// Union schema for all telemetry events
export const TelemetryEventSchema = z.discriminatedUnion('eventType', [
  SimulateSuccessEventSchema,
  DownloadPdfEventSchema,
  DownloadXlsEventSchema,
  DashboardOpenEventSchema,
  FormValidationFailedEventSchema,
]);

export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>;
export type SimulateSuccessEvent = z.infer<typeof SimulateSuccessEventSchema>;
export type DownloadPdfEvent = z.infer<typeof DownloadPdfEventSchema>;
export type DownloadXlsEvent = z.infer<typeof DownloadXlsEventSchema>;
export type DashboardOpenEvent = z.infer<typeof DashboardOpenEventSchema>;
export type FormValidationFailedEvent = z.infer<typeof FormValidationFailedEventSchema>;
