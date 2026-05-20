-- database/seed.sql
-- Data awal: akun admin default
-- Password: Admin@12345 (ganti setelah login pertama!)
-- Hash ini adalah PBKDF2 dari password "Admin@12345"

-- Hapus data lama kalau ada
DELETE FROM sessions;
DELETE FROM login_attempts;
DELETE FROM users WHERE email = 'admin@bibohunter.me';

-- Insert admin user
-- PENTING: Setelah deploy, login lalu ganti password segera!
INSERT INTO users (id, name, email, password, role, created_at, updated_at)
VALUES (
  'admin-seed-001',
  'Admin Ultron',
  'admin@bibohunter.me',
  'PLACEHOLDER_HASH',
  'admin',
  strftime('%s', 'now'),
  strftime('%s', 'now')
);
