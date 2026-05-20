// scripts/generate-admin.mjs
// Jalankan: node scripts/generate-admin.mjs
// Lalu copy output SQL-nya ke database/seed.sql

import { createId } from '@paralleldrive/cuid2'

const ITERATIONS = 100000
const SALT_LENGTH = 16
const HASH_LENGTH = 32

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const keyMaterial = await crypto.subtle.importKey('raw', data, { name: 'PBKDF2' }, false, ['deriveBits'])
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    HASH_LENGTH * 8
  )
  const hashArray = new Uint8Array(derivedBits)
  const saltB64 = btoa(String.fromCharCode(...salt))
  const hashB64 = btoa(String.fromCharCode(...hashArray))
  return `pbkdf2:${ITERATIONS}:${saltB64}:${hashB64}`
}

// === GANTI PASSWORD DI SINI ===
const ADMIN_PASSWORD = 'Admin@12345'
const ADMIN_EMAIL    = 'admin@bibohunter.me'
const ADMIN_NAME     = 'Admin Ultron'
// ==============================

const hash = await hashPassword(ADMIN_PASSWORD)
const id   = createId()
const now  = Math.floor(Date.now() / 1000)

console.log('\n✅ SQL untuk database/seed.sql:\n')
console.log(`DELETE FROM sessions;`)
console.log(`DELETE FROM login_attempts;`)
console.log(`DELETE FROM users WHERE email = '${ADMIN_EMAIL}';\n`)
console.log(`INSERT INTO users (id, name, email, password, role, created_at, updated_at)`)
console.log(`VALUES (`)
console.log(`  '${id}',`)
console.log(`  '${ADMIN_NAME}',`)
console.log(`  '${ADMIN_EMAIL}',`)
console.log(`  '${hash}',`)
console.log(`  'admin',`)
console.log(`  ${now},`)
console.log(`  ${now}`)
console.log(`);\n`)
console.log(`-- Password: ${ADMIN_PASSWORD}`)
console.log(`-- GANTI PASSWORD SETELAH LOGIN PERTAMA!\n`)
