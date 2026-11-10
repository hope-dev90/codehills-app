import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import * as ctrl from './favorites.controller.js';

const router = Router();

router.use(authenticate);

router.get('/',                   ctrl.listFavorites);
router.get('/ids',                ctrl.getFavoriteIds);
router.post('/:productId/toggle', ctrl.toggleFavorite);

export default router;
