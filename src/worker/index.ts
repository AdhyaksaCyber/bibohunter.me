import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { HTTPException } from 'hono/http-exception'
import { SignJWT, jwtVerify } from 'jose'
import { drizzle } from 'drizzle-orm/d1'
import { eq, sql, and, gt } from 'drizzle-orm'
import {
  integer,
  sqliteTable,
  text,
  real,
} from 'drizzle-orm/sqlite-core'
import bcrypt from 'bcryptjs'
import { createId } from '@paralleldrive/cuid2'
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import manifestJSON from '__STATIC_CONTENT_MANIFEST'

// === SECURITY MIDDLEWARE IMPORTS ===
import { rateLimitMiddleware } from './middleware/rateLimiter'
import { strictSecurityHeaders } from './middleware/security'
import { validateUploadSize } from './middleware/upload'
import { monitoringMiddleware } from './middleware/monitoring'
import { hashPassword, verifyPassword, validatePasswordStrength } from './utils/password'

const assetManifest = JSON.parse(manifestJSON)

// ============================================================
// ENV BINDINGS
// ============================================================
export interface Env {
  DB: D1Database
  R2: R2Bucket
  __STATIC_CONTENT: KVNamespace
  JWT_SECRET: string
  REFRESH_SECRET: string
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
  ALERT_WEBHOOK_URL?: string
  RECAPTCHA_SECRET_KEY: string
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
  lastLogin: integer('last_login'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
})

// Aligned with 004_login_attempts.sql — composite PK (email, ip), no id column
const loginAttempts = sqliteTable('login_attempts', {
  email: text('email').notNull(),
  ip: text('ip').notNull(),
  failedAttempts: integer('failed_attempts').notNull().default(0),
  lastFailedAt: integer('last_failed_at').notNull(),
  lockedUntil: integer('locked_until'),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
})

const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  refreshToken: text('refresh_token').notNull().unique(),
  expiresAt: integer('expires_at').notNull(),
  createdAt: integer('created_at').notNull(),
})

const rateLimits = sqliteTable('rate_limits', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  count: integer('count').default(0),
  resetAt: integer('reset_at').notNull(),
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

// ============================================================
// HELPERS
// ============================================================
const getJwtSecret = (secret: string) =>
  new TextEncoder().encode(secret)

async function signAccessToken(userId: string, role: string, secret: string, expiresIn: string) {
  return new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(getJwtSecret(secret))
}

async function signRefreshToken(userId: string, secret: string, expiresIn: string) {
  return new SignJWT({ sub: userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(getJwtSecret(secret))
}

async function verifyToken(token: string, secret: string) {
  const { payload } = await jwtVerify(token, getJwtSecret(secret))
  return payload as { sub: string; role: string; exp: number; type?: string }
}

function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function jsonOk(data: unknown, status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      ...(typeof data === 'object' && data !== null ? data : { data }),
    }),
    { status, headers: { 'Content-Type': 'application/json' } }
  )
}

// ============================================================
// RECAPTCHA HELPER
// ============================================================
async function verifyRecaptcha(token: string, secretKey: string): Promise<boolean> {
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    })
    const data = await res.json() as { success: boolean; 'error-codes'?: string[] }
    if (!data.success) {
      console.warn('[reCAPTCHA] Failed:', data['error-codes'])
    }
    return data.success === true
  } catch (err) {
    console.error('[reCAPTCHA] Fetch error:', err)
    return false
  }
}

// ============================================================
// BRUTE-FORCE PROTECTION HELPERS
// ============================================================
async function checkAccountLock(
  db: D1Database,
  email: string,
  ip: string
): Promise<{ locked: boolean; remainingSeconds?: number }> {
  const now = Math.floor(Date.now() / 1000)
  const { results } = await db
    .prepare(`SELECT failed_attempts, locked_until FROM login_attempts WHERE email = ? AND ip = ?`)
    .bind(email, ip)
    .all<{ locked_until: number | null; failed_attempts: number }>()

  const record = results[0]
  if (record?.locked_until && record.locked_until > now) {
    return { locked: true, remainingSeconds: record.locked_until - now }
  }
  return { locked: false }
}

// No id column — table uses composite PK (email, ip)
async function recordFailedAttempt(
  db: D1Database,
  email: string,
  ip: string,
  maxAttempts: number,
  lockDuration: number
): Promise<{ newAttempts: number; shouldLock: boolean; remainingSeconds: number }> {
  const now = Math.floor(Date.now() / 1000)

  const { results } = await db
    .prepare(`SELECT failed_attempts FROM login_attempts WHERE email = ? AND ip = ?`)
    .bind(email, ip)
    .all<{ failed_attempts: number }>()

  const currentAttempts = results[0]?.failed_attempts || 0
  const newAttempts = currentAttempts + 1
  const shouldLock = newAttempts >= maxAttempts
  const lockUntil = shouldLock ? now + lockDuration : null

  await db
    .prepare(
      `INSERT INTO login_attempts (email, ip, failed_attempts, last_failed_at, locked_until, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(email, ip) DO UPDATE SET
         failed_attempts = failed_attempts + 1,
         last_failed_at  = excluded.last_failed_at,
         locked_until    = CASE
           WHEN failed_attempts + 1 >= ? THEN excluded.locked_until
           ELSE locked_until
         END`
    )
    .bind(email, ip, newAttempts, now, lockUntil, now, maxAttempts)
    .run()

  return {
    newAttempts,
    shouldLock,
    remainingSeconds: lockUntil ? lockUntil - now : 0,
  }
}

async function clearFailedAttempts(db: D1Database, email: string, ip: string) {
  await db
    .prepare(`DELETE FROM login_attempts WHERE email = ? AND ip = ?`)
    .bind(email, ip)
    .run()
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

app.use('*', logger())
app.use('*', secureHeaders())
app.use('*', async (c, next) => {
  const origin = c.env.FRONTEND_URL || '*'
  return cors({
    origin,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: [
      'X-Request-Id',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Response-Time',
    ],
  })(c, next)
})

app.use('*', async (c, next) => {
  c.set('db', drizzle(c.env.DB))
  return await next()
})

app.use('*', rateLimitMiddleware())
app.use('*', monitoringMiddleware())
app.use('*', strictSecurityHeaders())

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', (c) =>
  c.json({
    ok: true,
    env: c.env.ENVIRONMENT,
    timestamp: new Date().toISOString(),
    version: '1.2.0',
  })
)

// ============================================================
// AUTH ROUTES
// ============================================================
const auth = new Hono<{ Bindings: Env; Variables: Variables }>()

auth.post('/register', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}))
    const { name, email, password, role } = body

    if (!name || !email || !password) {
      return jsonError('Name, email, dan password diperlukan')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return jsonError('Format email tidak valid')
    }

    const minLength = parseInt(c.env.PASSWORD_MIN_LENGTH || '8')
    const strength = validatePasswordStrength(password, minLength)
    if (!strength.valid) {
      return jsonError(`Password tidak kuat: ${strength.errors.join(', ')}`)
    }

    const db = c.get('db')
    const rawDb = c.env.DB

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get()
      .catch(() => null)
    if (existing) {
      return jsonError('Email sudah terdaftar', 409)
    }

    const passwordHash = await hashPassword(password)
    const now = Math.floor(Date.now() / 1000)
    const userId = createId()

    await rawDb
      .prepare(
        `INSERT INTO users (id, name, email, password, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(userId, name, email, passwordHash, role || 'student', now, now)
      .run()

    return jsonOk(
      {
        message: 'Registrasi berhasil. Silakan login.',
        user: { id: userId, name, email, role: role || 'student' },
      },
      201
    )
  } catch (error) {
    console.error('[Register Error]', error)
    return jsonError('Gagal melakukan registrasi', 500)
  }
})

auth.post('/login', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}))
    const { email, password, recaptchaToken } = body

    if (!email || !password) {
      return jsonError('Email dan password diperlukan')
    }

    // ===== STEP 1: Verify reCAPTCHA =====
    if (!recaptchaToken) {
      return jsonError('reCAPTCHA diperlukan', 400)
    }
    const rcOk = await verifyRecaptcha(recaptchaToken, c.env.RECAPTCHA_SECRET_KEY)
    if (!rcOk) {
      return jsonError('reCAPTCHA tidak valid. Silakan coba lagi.', 400)
    }

    const rawDb = c.env.DB
    const db = c.get('db')
    const ip = c.req.header('cf-connecting-ip') || 'unknown'
    const now = Math.floor(Date.now() / 1000)
    const maxAttempts = parseInt(c.env.MAX_LOGIN_ATTEMPT || '5')
    const lockDuration = parseInt(c.env.LOCK_DURATION_SEC || '60')

    // ===== STEP 2: Check account lock =====
    const lockCheck = await checkAccountLock(rawDb, email, ip)
    if (lockCheck.locked) {
      return jsonError(
        `Akun terkunci. Coba lagi dalam ${lockCheck.remainingSeconds} detik`,
        429
      )
    }

    // ===== STEP 3: Verify credentials =====
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get()
      .catch(() => null)

    let isValidPassword = false
    if (user) {
      if (user.password.startsWith('pbkdf2:') || user.password.startsWith('pbkdf2$')) {
        isValidPassword = await verifyPassword(password, user.password)
      } else if (user.password.startsWith('$2')) {
        isValidPassword = await bcrypt.compare(password, user.password).catch(() => false)
      }
    }

    // ===== STEP 4: Handle failed login =====
    if (!user || !isValidPassword) {
      const attempt = await recordFailedAttempt(rawDb, email, ip, maxAttempts, lockDuration)
      if (attempt.shouldLock) {
        return jsonError(
          `Terlalu banyak percobaan gagal. Akun dikunci selama ${attempt.remainingSeconds} detik`,
          429
        )
      }
      return jsonError('Email atau password salah', 401)
    }

    // ===== STEP 5: Success — clear attempts & update last login =====
    await clearFailedAttempts(rawDb, email, ip)
    await rawDb.prepare(`UPDATE users SET last_login = ? WHERE id = ?`).bind(now, user.id).run()

    // ===== STEP 6: Generate tokens =====
    const accessToken = await signAccessToken(
      user.id,
      user.role,
      c.env.JWT_SECRET,
      c.env.JWT_EXPIRES_IN || '900'
    )
    const refreshToken = await signRefreshToken(
      user.id,
      c.env.REFRESH_SECRET,
      c.env.REFRESH_TOKEN_EXPIRES || '604800'
    )
    const refreshExpires = parseInt(c.env.REFRESH_TOKEN_EXPIRES || '604800')

    await rawDb
      .prepare(
        `INSERT INTO sessions (id, user_id, refresh_token, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(createId(), user.id, refreshToken, now + refreshExpires, now)
      .run()

    return jsonOk({
      accessToken,
      refreshToken,
      expiresIn: parseInt(c.env.JWT_EXPIRES_IN || '900'),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error('[Login Error]', error)
    return jsonError('Gagal login', 500)
  }
})

auth.post('/refresh', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}))
    const { refreshToken } = body

    if (!refreshToken) {
      return jsonError('Refresh token diperlukan')
    }

    const db = c.get('db')
    const rawDb = c.env.DB
    const now = Math.floor(Date.now() / 1000)

    let payload: any
    try {
      payload = await verifyToken(refreshToken, c.env.REFRESH_SECRET)
    } catch {
      return jsonError('Refresh token tidak valid', 401)
    }

    if (payload.type !== 'refresh') {
      return jsonError('Token bukan refresh token', 401)
    }

    const session = await rawDb
      .prepare(`SELECT * FROM sessions WHERE refresh_token = ? AND expires_at > ?`)
      .bind(refreshToken, now)
      .all<{ user_id: string }>()

    if (!session.results.length) {
      return jsonError('Session tidak ditemukan atau expired', 401)
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.results[0].user_id))
      .get()
      .catch(() => null)

    if (!user) return jsonError('User tidak ditemukan', 404)

    const newAccessToken = await signAccessToken(
      user.id,
      user.role,
      c.env.JWT_SECRET,
      c.env.JWT_EXPIRES_IN || '900'
    )

    return jsonOk({
      accessToken: newAccessToken,
      expiresIn: parseInt(c.env.JWT_EXPIRES_IN || '900'),
    })
  } catch (error) {
    console.error('[Refresh Error]', error)
    return jsonError('Gagal refresh token', 500)
  }
})

auth.post('/logout', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    await c.env.DB.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(userId).run()
    return jsonOk({ message: 'Logout berhasil' })
  } catch (error) {
    console.error('[Logout Error]', error)
    return jsonError('Gagal logout', 500)
  }
})

app.route('/api/auth', auth)

// ============================================================
// STATIC FILE FALLBACK — serve SPA via KV assets
// ============================================================
app.get('*', async (c) => {
  const urlPath = new URL(c.req.url).pathname

  // API route tidak ditemukan → 404 JSON
  if (urlPath.startsWith('/api/')) {
    return c.json(
      { success: false, error: 'API endpoint not found', path: urlPath },
      404
    )
  }

  // Serve static asset dari KV, fallback ke index.html untuk SPA routing
  try {
    return await getAssetFromKV(
      {
        request: c.req.raw,
        waitUntil: (p: Promise<unknown>) => c.executionCtx.waitUntil(p),
      },
      {
        ASSET_NAMESPACE: c.env.__STATIC_CONTENT,
        ASSET_MANIFEST: assetManifest,
      }
    )
  } catch {
    // File tidak ditemukan → fallback ke index.html (SPA routing)
    try {
      return await getAssetFromKV(
        {
          request: new Request(new URL('/index.html', c.req.url).toString()),
          waitUntil: (p: Promise<unknown>) => c.executionCtx.waitUntil(p),
        },
        {
          ASSET_NAMESPACE: c.env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
        }
      )
    } catch {
      return c.json({ success: false, error: 'Not found' }, 404)
    }
  }
})

// ============================================================
// ERROR HANDLER
// ============================================================
app.onError((err, c) => {
  console.error('[Worker Error]', err)
  if (err instanceof HTTPException) {
    return jsonError(err.message, err.status)
  }
  return jsonError('Internal server error', 500)
})

export default app