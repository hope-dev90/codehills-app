export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (msg = 'Bad request', code = 'BAD_REQUEST', d) => new AppError(400, code, msg, d);
export const unauthorized = (msg = 'Authentication required', code = 'UNAUTHORIZED') => new AppError(401, code, msg);
export const forbidden = (msg = 'Forbidden', code = 'FORBIDDEN') => new AppError(403, code, msg);
export const notFound = (msg = 'Not found', code = 'NOT_FOUND') => new AppError(404, code, msg);
export const conflict = (msg = 'Conflict', code = 'CONFLICT') => new AppError(409, code, msg);
