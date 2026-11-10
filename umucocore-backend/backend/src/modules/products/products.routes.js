import { Router } from 'express';
import { optionalAuth } from '../../middleware/authenticate.js';
import * as ctrl from './products.controller.js';

const router = Router();

router.get('/',    optionalAuth, ctrl.listProducts);
router.get('/:id', optionalAuth, ctrl.getProduct);

export default router;
