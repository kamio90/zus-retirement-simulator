import { z } from 'zod';

export const ErrorPayloadSchema = z.object({
  error: z.string(),
  details: z.record(z.any()).optional(),
});

export type ErrorPayload = z.infer<typeof ErrorPayloadSchema>;
