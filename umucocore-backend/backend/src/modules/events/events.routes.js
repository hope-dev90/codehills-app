import { Router } from 'express';
import * as ctrl from './events.controller.js';

const router = Router();

router.get('/',    ctrl.listEvents);
router.get('/:id', ctrl.getEvent);

export default router;
