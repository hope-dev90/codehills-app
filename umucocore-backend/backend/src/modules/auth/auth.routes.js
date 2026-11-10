import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import {
  registerSchema,
  loginSchema,
  googleSchema,
  refreshSchema,
  changePasswordSchema,
} from './auth.schema.js';
import * as ctrl from './auth.controller.js';

const router = Router();

// Public
router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login',    validate(loginSchema),    ctrl.login);
router.post('/google',   validate(googleSchema),   ctrl.googleSignIn);
router.post('/refresh',  validate(refreshSchema),  ctrl.refresh);
router.post('/logout',   ctrl.logout);

// Protected
router.get('/me',             authenticate, ctrl.me);
router.put('/change-password', authenticate, validate(changePasswordSchema), ctrl.changePassword);

export default router;
