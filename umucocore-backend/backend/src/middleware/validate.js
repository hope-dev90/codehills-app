import { AppError } from '../utils/errors.js';

/**
 * validate(schema) — accepts either:
 *   - A Zod schema with shape keys { body, query, params } (e.g. z.object({ body: ... }))
 *   - A plain object { body: ZodSchema, query: ZodSchema, params: ZodSchema }
 *
 * Parsed values replace the originals on req.
 */
export const validate = (schemas) => (req, _res, next) => {
  // Support both z.object({ body, query, params }) and plain { body, query, params }
  const parts = schemas?.shape ?? schemas;
  for (const key of ['params', 'query', 'body']) {
    if (!parts[key]) continue;
    const r = parts[key].safeParse(req[key]);
    if (!r.success) {
      const details = r.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return next(new AppError(422, 'VALIDATION_ERROR', 'Validation failed', details));
    }
    if (key === 'query') {
      Object.defineProperty(req, 'query', { value: r.data, writable: true, configurable: true });
    } else {
      req[key] = r.data;
    }
  }
  next();
};
