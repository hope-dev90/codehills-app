import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import legalRoutes from './routes/legal.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet({
  // OAuth popups opened by expo-web-browser need to postMessage back to the
  // opener. The default 'same-origin' COOP policy blocks that.
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

// Minimal CORS: mirror the request origin so browser clients (the Expo web
// build and the admin dashboard) can call this API cross-origin, and answer
// preflight requests. Credentials are allowed, so the origin must be echoed
// back rather than '*'.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.vary('Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      req.headers['access-control-request-headers'] ?? 'Content-Type,Authorization',
    );
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '1mb' }));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests', error: 'RATE_LIMITED' },
  }),
);

app.use('/api', routes);
app.use(legalRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
