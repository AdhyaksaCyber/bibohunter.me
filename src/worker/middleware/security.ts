import { MiddlewareHandler } from 'hono'

/**
 * Generates secure HTTP headers per OWASP recommendations
 * Factory function — panggil sebagai app.use('*', strictSecurityHeaders())
 *
 * FIX: Sebelumnya export sebagai MiddlewareHandler langsung, tapi
 * dipanggil dengan () di index.ts → TypeError: b is not a function
 */
export function strictSecurityHeaders(): MiddlewareHandler {
  return async (c, next) => {
    await next()

    const nonce = crypto.randomUUID()
    const isApi = c.req.path.startsWith('/api')

    // Hono: setelah next(), gunakan c.header() bukan c.res.headers.set()
    // c.res bisa immutable di Cloudflare Workers — c.header() lebih aman

    // === Content Security Policy (CSP) ===
    c.header('Content-Security-Policy', [
      "default-src 'none'",
      `script-src 'nonce-${nonce}' 'strict-dynamic' https:`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self'",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; '))

    // === Force HTTPS (HSTS) ===
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

    // === Anti Clickjacking ===
    c.header('X-Frame-Options', 'DENY')

    // === Anti MIME Sniffing ===
    c.header('X-Content-Type-Options', 'nosniff')

    // === Referrer Policy ===
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin')

    // === Disable Dangerous Browser Features ===
    c.header('Permissions-Policy', [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()'
    ].join(', '))

    // === Cross-Origin Isolation ===
    c.header('Cross-Origin-Opener-Policy', 'same-origin')
    c.header('Cross-Origin-Embedder-Policy', 'require-corp')
    c.header('Cross-Origin-Resource-Policy', 'same-origin')

    // === Disable Legacy XSS Filter ===
    c.header('X-XSS-Protection', '0')

    // === Hide Server Info ===
    c.header('Server', 'cloudflare')

    // === No Cache untuk API ===
    if (isApi) {
      c.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
      c.header('Pragma', 'no-cache')
      c.header('Expires', '0')
    }
  }
}

/**
 * CORS helper untuk route tertentu (opsional)
 */
export function getCorsHeaders(env: any, origin?: string): Record<string, string> {
  const allowedOrigins = [
    env.FRONTEND_URL,
    env.ENVIRONMENT === 'development' ? 'http://localhost:5173' : null
  ].filter(Boolean) as string[]

  const isAllowed = origin && allowedOrigins.includes(origin)
  if (!isAllowed) return {}

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  }
}
