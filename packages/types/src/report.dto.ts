/**
 * DTOs and schemas for POST /api/report/pdf and /api/report/xls
 */
import { z } from 'zod';
import { SimulateRequestSchema, SimulationResultSchema } from './simulate.dto';

// Report input payload schema
export const ReportPayloadSchema = z
  .object({
    input: SimulateRequestSchema,
    result: SimulationResultSchema,
    chartImages: z
      .object({
        capitalTrajectoryBase64: z.string().optional(),
        comparisonsBase64: z.string().optional(),
      })
      .optional(),
    branding: z
      .object({
        appName: z.string().default('ZUS Retirement Simulator'),
        primaryHex: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .default('#007a33'),
      })
      .optional(),
  })
  .strict();

export type ReportPayload = z.infer<typeof ReportPayloadSchema>;

// PDF-specific schema
export const ReportPdfInputSchema = z
  .object({
    ...ReportPayloadSchema.shape,
    format: z.literal('pdf'),
  })
  .strict();

export type ReportPdfInput = z.infer<typeof ReportPdfInputSchema>;

// XLS-specific schema
export const ReportXlsInputSchema = z
  .object({
    ...ReportPayloadSchema.shape,
    format: z.literal('xls'),
  })
  .strict();

export type ReportXlsInput = z.infer<typeof ReportXlsInputSchema>;

// Response schemas
export const ReportPdfResponseSchema = z.object({
  url: z.string().url(),
  size: z.number().int().min(0),
  createdAt: z.string().datetime(),
});

export type ReportPdfResponse = z.infer<typeof ReportPdfResponseSchema>;

export const ReportXlsResponseSchema = z.object({
  url: z.string().url(),
  size: z.number().int().min(0),
  createdAt: z.string().datetime(),
});

export type ReportXlsResponse = z.infer<typeof ReportXlsResponseSchema>;
