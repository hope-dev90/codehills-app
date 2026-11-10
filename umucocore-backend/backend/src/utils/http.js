export const ok = (res, data = {}, message = 'Operation completed successfully', status = 200) =>
  res.status(status).json({ success: true, message, data });

export const created = (res, data = {}, message = 'Created successfully') => ok(res, data, message, 201);

export const fail = (res, status, error, message) =>
  res.status(status).json({ success: false, message, error });

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
