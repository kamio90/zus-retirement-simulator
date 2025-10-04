import { z } from 'zod';


import { SimulateInputSchema } from './simulate.dto';

export const ReportPdfInputSchema = z.object({
  simulation: SimulateInputSchema,
  format: z.literal('pdf'),
});

export const ReportXlsInputSchema = z.object({
  simulation: SimulateInputSchema,
  format: z.literal('xls'),
});


export type ReportPdfInput = z.infer<typeof ReportPdfInputSchema>;
export type ReportXlsInput = z.infer<typeof ReportXlsInputSchema>;

export interface ReportPdfResponse {
  url: string; // URL to generated PDF file
  size: number; // File size in bytes
  createdAt: string; // ISO date string
}

export interface ReportXlsResponse {
  url: string; // URL to generated XLS file
  size: number; // File size in bytes
  createdAt: string; // ISO date string
}
