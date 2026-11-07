import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import * as ctrl from './admin.controller.js';
import { collections } from './admin.content.controller.js';

const router = Router();

// Every admin endpoint requires a valid token whose role is "admin".
router.use(authenticate, authorize('admin'));

// Overview
router.get('/stats', ctrl.getStats);

// Users
router.get('/users', ctrl.listUsers);
router.patch('/users/:id', ctrl.updateUser);

// Orders
router.get('/orders', ctrl.listOrders);
router.patch('/orders/:id', ctrl.updateOrder);

// Content collections
for (const [name, collection] of Object.entries(collections)) {
  router.get(`/${name}`, collection.list);
  router.post(`/${name}`, collection.create);
  router.patch(`/${name}/:id`, collection.update);
  router.delete(`/${name}/:id`, collection.remove);
}

export default router;
