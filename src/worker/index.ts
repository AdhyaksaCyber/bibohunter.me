import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { HTTPException } from 'hono/http-exception'
import { SignJWT, jwtVerify } from 'jose'
import { drizzle } from 'drizzle-orm/d1'
import { eq, and, sql, desc, lt } from 'drizzle-orm'
import {
  integer,
  sqliteTable,
  text,
  real,
  blob,
} from 'drizzle-orm/sqlite-core'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { createId } from '@paralleldrive/cuid2'

// ============================================================
// ENV BINDINGS
// ============================================================
export interface Env {
  DB: D1Database
  R2: R2Bucket
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  REFRESH_TOKEN_EXPIRES: string
  MAX_LOGIN_ATTEMPT: string
  LOCK_DURATION_SEC: string
  MAX_UPLOAD_SIZE: string
  RATE_LIMIT_WINDOW: string
  RATE_LIMIT_MAX: string
  PASSWORD_MIN_LENGTH: string
  ENVIRONMENT: string
  FRONTEND_URL: string
}

// ============================================================
// DATABASE SCHEMA (Drizzle ORM)
// ============================================================
const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['admin', 'student'] }).default('student').notNull(),
  loginAttempts: integer('login_attempts').default(0).notNull(),
  lockedUntil: integer('locked_until'),
  lastLogin: integer('last_login'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
})

const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  refreshToken: text('refresh_token').notNull().unique(),
  expiresAt: integer('expires_at').notNull(),
  createdAt: integer('created_at').notNull(),
})

const materials = sqliteTable('materials', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  fileKey: text('file_key'),
  fileType: text('file_type'),
  fileSize: integer('file_size'),
  content: text('content'),
  order: integer('order').default(0),
  isPublished: integer('is_published', { mode: 'boolean' }).default(false),
  createdBy: text('created_by').references(() => users.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
})

const tryouts = sqliteTable('tryouts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  duration: integer('duration').notNull(),
  totalQuestions: integer('total_questions').default(0),
  passingScore: real('passing_score').default(70),
  isActive: integer('is_active', { mode: 'boolean' }).default(false),
  startsAt: integer('starts_at'),
  endsAt: integer('ends_at'),
  createdBy: text('created_by').references(() => users.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
})

const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  tryoutId: text('tryout_id').notNull().references(() => tryouts.id),
  text: text('text').notNull(),
  options: text('options').notNull(),
  correctAnswer: text('correct_answer').notNull(),
  explanation: text('explanation'),
  order: integer('order').default(0),
  createdAt: integer('created_at').notNull(),
})

const tryoutAttempts = sqliteTable('tryout_attempts', {
  id: text('id').primaryKey(),
  tryoutId: text('tryout_id').notNull().references(() => tryouts.id),
  userId: text('user_id').notNull().references(() => users.id),
  answers: text('answers'),
  score: real('score'),
  totalCorrect: integer('total_correct'),
  timeTaken: integer('time_taken'),
  status: text('status', { enum: ['in_progress', 'completed', 'expired'] }).default('in_progress'),
  startedAt: integer('started_at').notNull(),
  completedAt: integer('completed_at'),
})

const userProgress = sqliteTable('user_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  materialId: text('material_id').references(() => materials.id),
  tryoutId: text('tryout_id').references(() => tryouts.id),
  type: text('type', { enum: ['material_viewed', 'tryout_completed'] }).notNull(),
  metadata: text('metadata'),
  createdAt: integer('created_at').notNull(),
})

const rateLimits = sqliteTable('rate_limits', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  count: integer('count').default(0),
  resetAt: integer('reset_at').notNull(),
})

// ============================================================
// HELPERS
// ============================================================
const now = () => Math.floor(Date.now() / 1000)

const getJwtSecret = (secret: string) =>
  new TextEncoder().encode(secret)

async function signAccessToken(userId: string, role: string, secret: string, expiresIn: string) {
  return new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(getJwtSecret(secret))
}

async function verifyToken(token: string, secret: string) {
  const { payload } = await jwtVerify(token, getJwtSecret(secret))
  return payload as { sub: string; role: string; exp: number }
}

function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function jsonOk(data: unknown, status = 200) {
  return new Response(JSON.stringify({ success: true, ...(typeof data === 'object' && data !== null ? data : { data }) }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ============================================================
// MIDDLEWARE: AUTH
// ============================================================
type Variables = {
  userId: string
  userRole: string
  db: ReturnType<typeof drizzle>
}

async function authMiddleware(c: any, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonError('Unauthorized: missing token', 401)
  }
  const token = authHeader.slice(7)
  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET)
    c.set('userId', payload.sub)
    c.set('userRole', payload.role)
    return await next()
  } catch {
    return jsonError('Unauthorized: invalid or expired token', 401)
  }
}

function requireRole(...roles: string[]) {
  return async (c: any, next: () => Promise<void>) => {
    const role = c.get('userRole')
    if (!roles.includes(role)) {
      return jsonError('Forbidden: insufficient permissions', 403)
    }
    return await next()
  }
}

// ============================================================
// APP SETUP
// ============================================================
const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// Global middleware
app.use('*', logger())
app.use('*', secureHeaders())
app.use('*', async (c, next) => {
  const origin = c.env.FRONTEND_URL || '*'
  return cors({
    origin,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['X-Request-Id'],
  })(c, next)
})
app.use('*', async (c, next) => {
  c.set('db', drizzle(c.env.DB))
  return await next()
})

// Global error handler
app.onError((err, c) => {
  console.error('[Worker Error]', err)
  if (err instanceof HTTPException) {
    return jsonError(err.message, err.status)
  }
  return jsonError('Internal server error', 500)
})

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', (c) =>
  c.json({
    ok: true,
    env: c.env.ENVIRONMENT,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
)

// ============================================================
// AUTH ROUTES: /api/auth
// ============================================================
const auth = new Hono<{ Bindings: Env; Variables: Variables }>()

auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const { email, password } = body

  if (!email || !password) {
    return jsonError('Email dan password diperlukan')
  }

  const db = c.get('db')
  const user = await db.select().from(users).where(eq(users.email, email)).get().catch(() => null)

  if (!user) {
    return jsonError('Email atau password salah', 401)
  }

  const valid = await bcrypt.compare(password, user.password).catch(() => false)
  if (!valid) {
    return jsonError('Email atau password salah', 401)
  }

  const accessToken = await signAccessToken(user.id, user.role, c.env.JWT_SECRET, c.env.JWT_EXPIRES_IN || '900')
  const refreshToken = createId() + createId()

  return jsonOk({
    accessToken,
    refreshToken,
    expiresIn: parseInt(c.env.JWT_EXPIRES_IN || '900'),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
})

auth.get('/me', authMiddleware, async (c) => {
  const db = c.get('db')
  const user = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    lastLogin: users.lastLogin,
    createdAt: users.createdAt,
  }).from(users).where(eq(users.id, c.get('userId'))).get().catch(() => null)

  if (!user) {
    return jsonError('User tidak ditemukan', 404)
  }

  return jsonOk({ user })
})

app.route('/api/auth', auth)

// ============================================================
// ADMIN ROUTES
// ============================================================
const admin = new Hono<{ Bindings: Env; Variables: Variables }>()
admin.use('*', authMiddleware)

admin.get('/stats', requireRole('admin'), async (c) => {
  const db = c.get('db')

  try {
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users).get().catch(() => ({ count: 0 }))
    const totalMaterials = await db.select({ count: sql<number>`count(*)` }).from(materials).get().catch(() => ({ count: 0 }))
    const totalTryouts = await db.select({ count: sql<number>`count(*)` }).from(tryouts).get().catch(() => ({ count: 0 }))

    return jsonOk({
      totalUsers: totalUsers?.count || 0,
      totalMaterials: totalMaterials?.count || 0,
      totalTryouts: totalTryouts?.count || 0,
    })
  } catch (err) {
    console.error('[Admin stats error]', err)
    return jsonError('Failed to fetch stats')
  }
})

app.route('/api/admin', admin)

// ============================================================
// FALLBACK: Return SPA or API error
// ============================================================
app.all('*', (c) => {
  const path = c.req.path
  if (path.startsWith('/api')) {
    return jsonError('Not found', 404)
  }
  // For frontend routes, return simple message for now
  return c.json({ message: 'Frontend should be served by [site] in wrangler.toml' }, 404)
})

export default app
