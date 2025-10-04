import { Router } from 'express';
import { reportsController } from '../controllers/reportsController';
const router = Router();

router.get('/', reportsController.getReports);
router.post('/pdf', reportsController.generatePdf);

export default router;
