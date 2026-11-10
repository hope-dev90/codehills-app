import { Router } from 'express';
import * as ctrl from './artisans.controller.js';

const router = Router();

router.get('/',    ctrl.listArtisans);
router.get('/:id', ctrl.getArtisan);

export default router;
