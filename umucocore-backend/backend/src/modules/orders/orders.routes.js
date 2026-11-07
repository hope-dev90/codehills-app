import { Router } from 'express';
import { authenticate, optionalAuth } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { createOrderSchema } from './orders.schema.js';
import * as ctrl from './orders.controller.js';

const router = Router();

// Guest checkout is allowed (optionalAuth); authenticated users get their orders saved
router.post('/', optionalAuth, validate(createOrderSchema), ctrl.placeOrder);

// History requires auth
router.get('/',    authenticate, ctrl.listOrders);
router.get('/:id', authenticate, ctrl.getOrder);

export default router;
