-- migrations/004_login_attempts.sql
-- Login attempt tracking for brute-force protection
-- Track per email+IP combination (lebih granular daripada per user)

CREATE TABLE IF NOT EXISTS login_attempts (
  email TEXT NOT NULL,
  ip TEXT NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  last_failed_at INTEGER NOT NULL,
  locked_until INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  PRIMARY KEY (email, ip)
);

-- Index untuk locked accounts lookup
CREATE INDEX IF NOT EXISTS idx_login_attempts_locked 
ON login_attempts(locked_until) 
WHERE locked_until IS NOT NULL;

-- Index untuk cleanup queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_last_failed 
ON login_attempts(last_failed_at);

-- Trigger auto-update timestamp
CREATE TRIGGER IF NOT EXISTS update_login_attempts_timestamp 
AFTER UPDATE ON login_attempts
FOR EACH ROW
BEGIN
  UPDATE login_attempts 
  SET updated_at = strftime('%s', 'now') 
  WHERE email = NEW.email AND ip = NEW.ip;
END;
