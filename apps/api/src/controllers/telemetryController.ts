import { Request, Response } from 'express';
import { TelemetryEventSchema } from '@zus/types';
import { telemetryService } from '../services/telemetryService';

export const telemetryController = {
  sendTelemetry: (req: Request, res: Response): void => {
    try {
      // Validate the telemetry event
      const event = TelemetryEventSchema.parse(req.body);

      // Store the event
      telemetryService.sendTelemetry(event);

      res.status(200).json({
        success: true,
        message: 'Telemetry event recorded',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid telemetry event format',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
};
