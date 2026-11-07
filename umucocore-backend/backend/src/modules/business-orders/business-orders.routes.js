import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { updateStatusSchema } from './business-orders.schema.js';
import * as ctrl from './business-orders.controller.js';

const router = Router();

router.use(authenticate);

router.get('/',          ctrl.listOrders);
router.patch('/:id',     validate(updateStatusSchema), ctrl.updateStatus);

export default router;
