import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { updateProfileSchema } from './users.schema.js';
import * as ctrl from './users.controller.js';

const router = Router();

router.get('/',   authenticate, ctrl.getProfile);
router.patch('/', authenticate, validate(updateProfileSchema), ctrl.updateProfile);

export default router;
