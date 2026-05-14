-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','viewer','user')),
  active INTEGER DEFAULT 1,
  created TEXT NOT NULL
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT NOT NULL,
  type TEXT NOT NULL,
  time TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('twk','tiu','tkp')),
  pdf_url TEXT NOT NULL,
  "order" INTEGER NOT NULL
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  user_id TEXT NOT NULL,
  material_id TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  score INTEGER,
  last_accessed TEXT NOT NULL,
  PRIMARY KEY(user_id, material_id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(material_id) REFERENCES materials(id)
);

-- Insert default admin user (password: admin123)
-- Hash for 'admin123' using SHA-256
INSERT OR IGNORE INTO users (id, name, username, hash, role, active, created)
VALUES (
  'admin-001',
  'Administrator',
  'admin',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'admin',
  1,
  datetime('now')
);
