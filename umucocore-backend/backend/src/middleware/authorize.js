import { forbidden, unauthorized } from '../utils/errors.js';

/** Usage: router.post('/', authenticate, authorize('admin'), handler) */
export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  if (!roles.includes(req.user.role)) return next(forbidden('Insufficient permissions'));
  next();
};
