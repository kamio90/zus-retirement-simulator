import { Router } from 'express';
import { benchmarksController } from '../controllers/benchmarksController';
const router = Router();

router.get('/', benchmarksController.getBenchmarks);

export default router;
