import { AppError } from '../utils/errors.js';
import { env } from '../config/env.js';

export function notFoundHandler(req, _res, next) {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      error: err.code,
      ...(err.details ? { details: err.details } : {}),
    });
  }
  // Prisma known errors
  if (err?.code === 'P2002') {
    return res.status(409).json({ success: false, message: 'Resource already exists', error: 'DUPLICATE' });
  }
  if (err?.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Resource not found', error: 'NOT_FOUND' });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON body', error: 'INVALID_JSON' });
  }
  // Never log request bodies/headers (may contain passwords or tokens).
  console.error(`[error] ${req.method} ${req.path}:`, err?.message);
  if (!env.isProd && err?.stack) console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' });
}
