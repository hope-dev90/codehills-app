import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { addItemSchema, updateItemSchema } from './cart.schema.js';
import * as ctrl from './cart.controller.js';

const router = Router();

router.use(authenticate);

router.get('/',                        ctrl.getCart);
router.post('/',   validate(addItemSchema),           ctrl.addItem);
router.patch('/:productId', validate(updateItemSchema), ctrl.updateItem);
router.delete('/:productId',           ctrl.removeItem);
router.delete('/',                     ctrl.clearCart);

export default router;
