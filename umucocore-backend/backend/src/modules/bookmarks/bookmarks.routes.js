import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import * as ctrl from './bookmarks.controller.js';

const router = Router();

router.use(authenticate);

router.get('/',                 ctrl.listBookmarks);
router.get('/ids',              ctrl.getBookmarkIds);
router.post('/:storyId/toggle', ctrl.toggleBookmark);

export default router;
