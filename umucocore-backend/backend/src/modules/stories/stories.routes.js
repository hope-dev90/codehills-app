import { Router } from 'express';
import { optionalAuth } from '../../middleware/authenticate.js';
import * as ctrl from './stories.controller.js';

const router = Router();

router.get('/',    optionalAuth, ctrl.listStories);
router.get('/:id', optionalAuth, ctrl.getStory);

export default router;
