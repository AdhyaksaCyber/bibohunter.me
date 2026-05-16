import { MiddlewareHandler } from 'hono'

interface AlertPayload {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  status: number
  url: string
  metadata?: Record<string, any>
}

/**
 * Send alert to Discord/Slack webhook
 */
async function sendAlert(env: any, data: AlertPayload): Promise<void> {
  try {
    if (env.ALERT_WEBHOOK_URL) {
      const color = {
        LOW: 0x00FF00,
        MEDIUM: 0xFFA500,
        HIGH: 0xFF4500,
        CRITICAL: 0xFF0000
      }[data.severity]

      await fetch(env.ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚨 **${data.severity}** Security Alert`,
          embeds: [{
            title: data.message,
            description: `**Status:** ${data.status}\n**URL:** ${data.url}`,
            color: color,
            timestamp: new Date().toISOString(),
            fields: Object.entries(data.metadata || {}).map(([key, value]) => ({
              name: key,
              value: String(value).substring(0, 1000),
              inline: true
            }))
          }]
        })
      })
    }

    // Selalu log ke console (terlihat di Cloudflare Logs)
    console.error(`[ALERT - ${data.severity}]`, JSON.stringify(data))

  } catch (error) {
    console.error('[Alert Send Error]', error)
  }
}

/**
 * Track metrics and send alerts based on response
 * Dipasang SETELAH route handler (await next())
 *
 * FIX: Ganti c.res.headers.set() → c.header() agar tidak throw
 * "immutable headers" error di Cloudflare Workers setelah next()
 */
export function monitoringMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const startTime = Date.now()
    const ip = c.req.header('cf-connecting-ip') || 'unknown'
    const country = (c.req.raw as any).cf?.country || 'XX'
    const userAgent = c.req.header('user-agent') || 'unknown'

    await next()

    const duration = Date.now() - startTime
    const status = c.res.status
    const path = c.req.path
    const method = c.req.method

    try {
      // === ALERT: Server Error 5xx ===
      if (status >= 500) {
        c.executionCtx.waitUntil(
          sendAlert(c.env, {
            severity: 'HIGH',
            message: '5xx Server Error Detected',
            status,
            url: c.req.url,
            metadata: {
              method,
              duration_ms: duration,
              country,
              path,
              user_agent: userAgent.slice(0, 100)
            }
          })
        )
      }

      // === ALERT: Rate Limit Hit (429) ===
      if (status === 429) {
        const isLoginPath = path.includes('/login')
        c.executionCtx.waitUntil(
          sendAlert(c.env, {
            severity: isLoginPath ? 'HIGH' : 'MEDIUM',
            message: isLoginPath ? 'Potential Brute Force Attack' : 'Rate Limit Triggered',
            status: 429,
            url: c.req.url,
            metadata: {
              ip,
              path,
              user_agent: userAgent.slice(0, 100)
            }
          })
        )
      }

      // === LOG: Auth Failure (401) ===
      if (path.includes('/auth/') && status === 401) {
        console.warn('[Auth Failure]', { ip, path, duration_ms: duration })
      }

      // === Performance Header (dev only) ===
      // FIX: Pakai c.header() bukan c.res.headers.set() — aman setelah next()
      if (c.env.ENVIRONMENT === 'development') {
        c.header('X-Response-Time', `${duration}ms`)
        c.header('X-Request-ID', crypto.randomUUID())
      }

    } catch (error) {
      console.error('[Metrics Tracking Error]', error)
    }
  }
}
