import { MiddlewareHandler } from 'hono'

interface RateLimitRecord {
  key: string
  count: number
  reset_at: number
}

/**
 * D1-based rate limiter middleware
 * Prevents API abuse and DoS attacks
 */
export function rateLimitMiddleware(
  maxRequests: number = 100,
  windowSeconds: number = 900
): MiddlewareHandler {
  return async (c, next) => {
    const db = c.env.DB
    const ip = c.req.header('cf-connecting-ip') || 'unknown'
    const key = `rate:${ip}`
    const now = Math.floor(Date.now() / 1000)
    const resetAt = now + windowSeconds

    try {
      // Upsert: Insert kalau belum ada, update kalau sudah ada
      await db.prepare(`
        INSERT INTO rate_limits (id, key, count, reset_at) 
        VALUES (?, ?, 1, ?)
        ON CONFLICT(key) DO UPDATE SET
          count = CASE 
            WHEN reset_at < ? THEN 1
            ELSE count + 1
          END,
          reset_at = CASE
            WHEN reset_at < ? THEN ?
            ELSE reset_at
          END
      `).bind(crypto.randomUUID(), key, resetAt, now, now, resetAt).run()

      // Cek apakah sudah melebihi limit
      const result = await db.prepare(`
        SELECT count, reset_at FROM rate_limits WHERE key = ?
      `).bind(key).all()

      const record = (result.results as RateLimitRecord[])[0]

      if (record && record.count > maxRequests) {
        const retryAfter = Math.max(1, record.reset_at - now)
        
        return c.json({
          success: false,
          error: 'Rate limit exceeded. Too many requests.',
          code: 'RATE_LIMIT_EXCEEDED',
          retry_after: retryAfter,
          limit: maxRequests,
          window_seconds: windowSeconds,
          reset_at: new Date(record.reset_at * 1000).toISOString()
        }, 429)
      }

      // Tambahin header ke response (biar frontend tahu sisa quota)
      if (record) {
        const remaining = Math.max(0, maxRequests - record.count)
        c.header('X-RateLimit-Limit', maxRequests.toString())
        c.header('X-RateLimit-Remaining', remaining.toString())
        c.header('X-RateLimit-Reset', record.reset_at.toString())
      }

    } catch (error) {
      console.error('[Rate Limit Error]', error)
      // Fail open - jangan blok request kalau DB error
    }

    await next()
  }
}

/**
 * Cleanup old rate limit records (panggil via CRON trigger)
 */
export async function cleanupRateLimits(db: D1Database): Promise<void> {
  const now = Math.floor(Date.now() / 1000)
  
  await db.prepare(`
    DELETE FROM rate_limits WHERE reset_at < ?
  `).bind(now).run()
}
