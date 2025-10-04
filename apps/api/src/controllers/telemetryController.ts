import { Request, Response } from 'express';
import { telemetryService } from '../services/telemetryService';

export const telemetryController = {
  sendTelemetry: (req: Request, res: Response) => {
    // Placeholder: delegate to service
    telemetryService.sendTelemetry(req.body);
    res.status(200).json({ message: 'Telemetry endpoint placeholder' });
  },
};
