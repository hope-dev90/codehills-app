import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import * as ctrl from './business-plans.controller.js';

const router = Router();

router.use(authenticate);

router.get('/',       ctrl.getPlan);
router.post('/regen', ctrl.regeneratePlan);

export default router;
