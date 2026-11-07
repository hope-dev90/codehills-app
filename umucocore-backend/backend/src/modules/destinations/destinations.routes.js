import { Router } from 'express';
import * as ctrl from './destinations.controller.js';

const router = Router();

router.get('/',    ctrl.listDestinations);
router.get('/:id', ctrl.getDestination);

export default router;
