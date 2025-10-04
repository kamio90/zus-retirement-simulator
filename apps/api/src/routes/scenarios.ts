import { Router } from 'express';
import { scenariosController } from '../controllers/scenariosController';

const router = Router();

// POST /api/scenarios/jdg-quick - JDG quick calculation
router.post('/jdg-quick', scenariosController.jdgQuick);

// POST /api/scenarios/compose - Multi-period career composition
router.post('/compose', scenariosController.compose);

// POST /api/scenarios/compare - Scenario comparisons
router.post('/compare', scenariosController.compare);

export default router;
