import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import * as ctrl from './rewards.controller.js';

const router = Router();

router.use(authenticate);

router.get('/',    ctrl.listUnlockedStories);
router.get('/ids', ctrl.getUnlockedIds);

export default router;
