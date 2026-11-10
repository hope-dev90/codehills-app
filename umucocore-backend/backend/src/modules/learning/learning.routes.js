import { Router } from 'express';
import { optionalAuth } from '../../middleware/authenticate.js';
import * as ctrl from './learning.controller.js';

const router = Router();

router.get('/',    optionalAuth, ctrl.listResources);
router.get('/:id', optionalAuth, ctrl.getResource);

export default router;
