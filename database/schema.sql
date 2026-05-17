-- ============================================================
-- Ultron Bimbel - D1 Database Migration
-- Jalankan: wrangler d1 execute ultron-bimbel-dev --local --file=./database/schema.sql
-- Production: wrangler d1 execute ultron-bimbel --env production --file=./database/schema.sql
-- ============================================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER,
  last_login INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- MATERIALS
CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  file_key TEXT,
  file_type TEXT,
  file_size INTEGER,
  content TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 0,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_published ON materials(is_published);

-- TRYOUTS
CREATE TABLE IF NOT EXISTS tryouts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  duration INTEGER NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 0,
  passing_score REAL NOT NULL DEFAULT 70,
  is_active INTEGER NOT NULL DEFAULT 0,
  starts_at INTEGER,
  ends_at INTEGER,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tryouts_category ON tryouts(category);
CREATE INDEX IF NOT EXISTS idx_tryouts_active ON tryouts(is_active);

-- QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  tryout_id TEXT NOT NULL REFERENCES tryouts(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  options TEXT NOT NULL, -- JSON: [{key: 'A', value: '...'}, ...]
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_questions_tryout_id ON questions(tryout_id);

-- TRYOUT ATTEMPTS
CREATE TABLE IF NOT EXISTS tryout_attempts (
  id TEXT PRIMARY KEY,
  tryout_id TEXT NOT NULL REFERENCES tryouts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers TEXT, -- JSON: {questionId: 'A', ...}
  score REAL,
  total_correct INTEGER,
  time_taken INTEGER,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'expired')),
  started_at INTEGER NOT NULL,
  completed_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON tryout_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_tryout_id ON tryout_attempts(tryout_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON tryout_attempts(status);

-- USER PROGRESS
CREATE TABLE IF NOT EXISTS user_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  material_id TEXT REFERENCES materials(id) ON DELETE SET NULL,
  tryout_id TEXT REFERENCES tryouts(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('material_viewed', 'tryout_completed')),
  metadata TEXT, -- JSON
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_type ON user_progress(type);

-- RATE LIMITS
CREATE TABLE IF NOT EXISTS rate_limits (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 0,
  reset_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);

-- ============================================================
-- SEED: Admin default (password: Admin@1234)
-- Ganti password setelah pertama login!
-- ============================================================
INSERT OR IGNORE INTO users (id, name, email, password, role, login_attempts, created_at, updated_at)
VALUES (
  'admin_default_001',
  'Administrator',
  'admin@bibohunter.me',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LedgQTZ3ygP6MeVMy',
  'admin',
  0,
  unixepoch(),
  unixepoch()
);