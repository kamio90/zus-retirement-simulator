import { Router } from 'express';
import { contentController } from '../controllers/contentController';

const router = Router();

router.get('/knowledge', contentController.getKnowledge);
router.get('/explainers', contentController.getExplainers);

export default router;
