import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet({
  // OAuth popups opened by expo-web-browser need to postMessage back to the
  // opener. The default 'same-origin' COOP policy blocks that.
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  }),
);
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
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
