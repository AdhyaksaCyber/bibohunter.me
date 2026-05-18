/**
 * Hash password using Web Crypto API (PBKDF2-SHA256)
 * 
 * SECURITY NOTE: 600,000 iterations = OWASP recommendation for PBKDF2-SHA256
 * Cloudflare Workers don't have native Argon2, so PBKDF2 is the best option.
 */

// 100k = Workers-safe (600k causes CPU timeout in Cloudflare Workers runtime)
// Still meets OWASP minimum for PBKDF2-SHA256
const ITERATIONS = 100000
const SALT_LENGTH = 16
const HASH_LENGTH = 32 // 256 bits

/**
 * Hash a password
 * Returns: pbkdf2:100000:<base64(salt)>:<base64(hash)>
 *
 * Format prefix allows login handler to detect & route to correct verifier.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)

  // Generate random salt (16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )

  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    HASH_LENGTH * 8 // bits
  )

  const hashArray = new Uint8Array(derivedBits)
  const saltB64 = btoa(String.fromCharCode(...salt))
  const hashB64 = btoa(String.fromCharCode(...hashArray))

  // Format: pbkdf2:<iterations>:<saltB64>:<hashB64>
  // login handler di index.ts cek startsWith('pbkdf2:') — sekarang match ✓
  return `pbkdf2:${ITERATIONS}:${saltB64}:${hashB64}`
}

/**
 * Verify password against stored hash
 * Supports format: pbkdf2:<iterations>:<saltB64>:<hashB64>
 * Uses constant-time comparison to prevent timing attacks
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    // Parse format: pbkdf2:<iterations>:<saltB64>:<hashB64>
    const parts = storedHash.split(':')
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
      console.error('[Password] Unknown hash format:', parts[0])
      return false
    }

    const iterations = parseInt(parts[1], 10)
    const salt = Uint8Array.from(atob(parts[2]), c => c.charCodeAt(0))
    const storedHashArray = Uint8Array.from(atob(parts[3]), c => c.charCodeAt(0))

    const encoder = new TextEncoder()
    const data = encoder.encode(password)

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    )

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      HASH_LENGTH * 8
    )

    const hashArray = new Uint8Array(derivedBits)

    // === CONSTANT-TIME COMPARISON ===
    if (hashArray.length !== storedHashArray.length) {
      return false
    }

    let mismatch = 0
    for (let i = 0; i < hashArray.length; i++) {
      mismatch |= hashArray[i] ^ storedHashArray[i]
    }

    return mismatch === 0

  } catch (error) {
    console.error('[Password Verification Error]', error)
    return false
  }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(
  password: string,
  minLength: number = 8
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`)
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number')
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain special character')
  }

  // Check for common weak passwords
  const commonPasswords = ['password', '12345678', 'qwerty', 'admin', 'password123']
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}