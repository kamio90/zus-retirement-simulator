import { Router } from 'express';
import { simulateController } from '../controllers/simulateController';
const router = Router();

router.post('/', simulateController.simulate);

export default router;
