/**
 * Hash password using Web Crypto API (PBKDF2-SHA256)
 * 
 * SECURITY NOTE: 600,000 iterations = OWASP recommendation for PBKDF2-SHA256
 * Cloudflare Workers don't have native Argon2, so PBKDF2 is the best option.
 */

const ITERATIONS = 600000
const SALT_LENGTH = 16
const HASH_LENGTH = 32 // 256 bits

/**
 * Hash a password
 * Returns: base64(salt + hash)
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

  // Combine salt + hash
  const combined = new Uint8Array(SALT_LENGTH + HASH_LENGTH)
  combined.set(salt)
  combined.set(hashArray, SALT_LENGTH)

  // Encode as base64
  return btoa(String.fromCharCode(...combined))
}

/**
 * Verify password against stored hash
 * Uses constant-time comparison to prevent timing attacks
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    // Decode stored hash
    const combined = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0))
    const salt = combined.slice(0, SALT_LENGTH)
    const storedHashArray = combined.slice(SALT_LENGTH)

    // Hash provided password with same salt
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
        iterations: ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      HASH_LENGTH * 8
    )

    const hashArray = new Uint8Array(derivedBits)

    // === CONSTANT-TIME COMPARISON ===
    // Jangan pakai === biasa! Timing attack bisa nebak password dari waktu response.
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
