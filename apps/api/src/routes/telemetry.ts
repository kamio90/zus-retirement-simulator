import { Router } from 'express';
import { telemetryController } from '../controllers/telemetryController';
const router = Router();

router.post('/', telemetryController.sendTelemetry);

export default router;
