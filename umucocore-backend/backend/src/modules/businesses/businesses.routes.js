import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { saveBusinessSchema } from './businesses.schema.js';
import * as ctrl from './businesses.controller.js';

const router = Router();

router.use(authenticate);

router.get('/',    ctrl.getBusiness);
router.put('/',    validate(saveBusinessSchema), ctrl.saveBusiness);
router.delete('/', ctrl.deleteBusiness);

export default router;
