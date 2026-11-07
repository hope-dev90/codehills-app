import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { addProductSchema, updateProductSchema } from './business-products.schema.js';
import * as ctrl from './business-products.controller.js';

const router = Router();

router.use(authenticate);

router.get('/',    ctrl.listProducts);
router.post('/',   validate(addProductSchema),    ctrl.addProduct);
router.patch('/:id', validate(updateProductSchema), ctrl.updateProduct);
router.delete('/:id', ctrl.removeProduct);

export default router;
