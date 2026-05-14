import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import type { Context } from 'hono';

// Routes
import authRoutes from './routes/auth';
import materiRoutes from './routes/materi';
import tryoutRoutes from './routes/tryout';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';

const app = new Hono<{
  Bindings: {
    DB?: D1Database;
    R2?: R2Bucket;
    JWT_SECRET: string;
    ENVIRONMENT: string;
    MAX_LOGIN_ATTEMPT: string;
    LOCK_DURATION_SEC: string;
    JWT_EXPIRES_IN: string;
    REFRESH_TOKEN_EXPIRES: string;
    MAX_UPLOAD_SIZE: string;
    RATE_LIMIT_WINDOW: string;
    RATE_LIMIT_MAX: string;
    PASSWORD_MIN_LENGTH: string;
    API_URL: string;
    FRONTEND_URL: string;
  };
}>();

// ──── MIDDLEWARE ────
app.use(logger());
app.use(secureHeaders());

// CORS configuration
app.use(
  cors({
    origin: (origin, c) => {
      const allowed = [
        c.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5173',
      ];
      return allowed.includes(origin) ? origin : 'http://localhost:5173';
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// Request size limit middleware
app.use(async (c, next) => {
  const maxSize = parseInt(c.env.MAX_REQUEST_SIZE || '5242880', 10);
  const contentLength = c.req.header('content-length');

  if (contentLength && parseInt(contentLength, 10) > maxSize) {
    return c.json(
      { success: false, error: 'Request size exceeds maximum limit' },
      { status: 413 }
    );
  }

  await next();
});

// Rate limiting middleware (simple implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

app.use(async (c, next) => {
  const ip = c.req.header('cf-connecting-ip') || 'unknown';
  const now = Date.now();
  const windowMs = parseInt(c.env.RATE_LIMIT_WINDOW || '900000', 10);
  const maxRequests = parseInt(c.env.RATE_LIMIT_MAX || '100', 10);

  let record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
  } else {
    record.count++;
  }

  requestCounts.set(ip, record);

  if (record.count > maxRequests) {
    return c.json(
      { success: false, error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  await next();
});

// Request ID middleware
app.use(async (c, next) => {
  const requestId = crypto.randomUUID();
  c.set('requestId', requestId);
  c.header('X-Request-ID', requestId);
  await next();
});

// ──── ROUTES ────
app.route('/api/auth', authRoutes);
app.route('/api/materi', materiRoutes);
app.route('/api/tryout', tryoutRoutes);
app.route('/api/user', userRoutes);
app.route('/api/admin', adminRoutes);

// ──── HEALTH CHECK ────
app.get('/health', (c) => {
  return c.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
  });
});

// ──── 404 HANDLER ────
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Not found',
      code: 'NOT_FOUND',
    },
    { status: 404 }
  );
});

// ──── ERROR HANDLER ────
app.onError((err, c) => {
  console.error('[ERROR]', err);

  const status = err instanceof Error && 'status' in err ? (err as any).status : 500;

  return c.json(
    {
      success: false,
      error: err.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
      requestId: c.get('requestId'),
    },
    { status }
  );
});

export default app;
