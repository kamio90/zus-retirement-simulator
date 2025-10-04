import { Router } from 'express';
import { adminController } from '../controllers/adminController';

const router = Router();

// Export telemetry data in JSONL or CSV format
router.get('/telemetry/export', adminController.exportTelemetry);

// Get telemetry statistics
router.get('/telemetry/stats', adminController.getTelemetryStats);

export default router;
