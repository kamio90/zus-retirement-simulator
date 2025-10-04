import { Router } from 'express';
import { v2WizardController } from '../controllers/v2WizardController';

const router = Router();

// Wizard step endpoints
router.post('/wizard/init', v2WizardController.init);
router.post('/wizard/contract', v2WizardController.contract);
router.post('/wizard/jdg', v2WizardController.jdg);

// Compare endpoints
router.post('/compare/higher-zus', v2WizardController.higherZus);
router.post('/compare/as-uop', v2WizardController.asUop);
router.post('/compare/what-if', v2WizardController.whatIf);

// Final simulate endpoint
router.post('/simulate', v2WizardController.simulate);

export default router;
