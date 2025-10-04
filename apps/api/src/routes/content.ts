import { Router } from 'express';
import { contentController } from '../controllers/contentController';

const router = Router();

router.get('/knowledge', contentController.getKnowledge);

export default router;
