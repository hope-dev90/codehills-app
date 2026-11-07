import { Router } from 'express';
import { ok } from '../utils/http.js';

import authRoutes            from '../modules/auth/auth.routes.js';
import userRoutes            from '../modules/users/users.routes.js';
import storyRoutes           from '../modules/stories/stories.routes.js';
import destinationRoutes     from '../modules/destinations/destinations.routes.js';
import eventRoutes           from '../modules/events/events.routes.js';
import artisanRoutes         from '../modules/artisans/artisans.routes.js';
import productRoutes         from '../modules/products/products.routes.js';
import favoriteRoutes        from '../modules/favorites/favorites.routes.js';
import bookmarkRoutes        from '../modules/bookmarks/bookmarks.routes.js';
import cartRoutes            from '../modules/cart/cart.routes.js';
import orderRoutes           from '../modules/orders/orders.routes.js';
import rewardRoutes          from '../modules/rewards/rewards.routes.js';
import businessRoutes        from '../modules/businesses/businesses.routes.js';
import businessProductRoutes from '../modules/business-products/business-products.routes.js';
import businessOrderRoutes   from '../modules/business-orders/business-orders.routes.js';
import businessPlanRoutes    from '../modules/business-plans/business-plans.routes.js';
import learningRoutes        from '../modules/learning/learning.routes.js';
import adminRoutes           from '../modules/admin/admin.routes.js';

const router = Router();

// Health
router.get('/health', (_req, res) => ok(res, { status: 'up', time: new Date().toISOString() }));

// Auth
router.use('/auth',              authRoutes);
router.use('/users/me',          userRoutes);

// Content
router.use('/stories',           storyRoutes);
router.use('/destinations',      destinationRoutes);
router.use('/events',            eventRoutes);
router.use('/artisans',          artisanRoutes);

// Marketplace
router.use('/products',          productRoutes);

// User collections
router.use('/favorites',         favoriteRoutes);
router.use('/bookmarks',         bookmarkRoutes);
router.use('/rewards',           rewardRoutes);

// Shopping
router.use('/cart',              cartRoutes);
router.use('/orders',            orderRoutes);

// Business tools
router.use('/business',          businessRoutes);
router.use('/business/products', businessProductRoutes);
router.use('/business/orders',   businessOrderRoutes);
router.use('/business/plan',     businessPlanRoutes);

// Learning
router.use('/learning',          learningRoutes);

// Admin dashboard
router.use('/admin',             adminRoutes);

export default router;
