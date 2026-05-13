import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import { sign, verify } from 'jose';
import { existsSync, mkdirSync } from 'fs';

// Setup SQLite database
const dbPath = './ultron-dev.db';
const db = new Database(dbPath);

// Create tables if not exists
const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','viewer','user')),
      active INTEGER DEFAULT 1,
      created TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      detail TEXT NOT NULL,
      type TEXT NOT NULL,
      time TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('twk','tiu','tkp')),
      pdf_url TEXT NOT NULL,
      "order" INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      user_id TEXT NOT NULL,
      material_id TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      score INTEGER,
      last_accessed TEXT NOT NULL,
      PRIMARY KEY(user_id, material_id)
    );
  `);

  // Insert default admin if not exists
  const adminExists = db.prepare("SELECT id FROM users WHERE username = 'admin'").get();
  if (!adminExists) {
    // Hash for 'admin123'
    const hash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
    db.prepare(`
      INSERT INTO users (id, name, username, hash, role, active, created)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('admin-001', 'Administrator', 'admin', hash, 'admin', 1, new Date().toISOString());
    console.log('Default admin created: admin / admin123');
  }

  // Insert sample materials
  const materialsCount = db.prepare("SELECT COUNT(*) as count FROM materials").get() as { count: number };
  if (materialsCount.count === 0) {
    const sampleMaterials = [
      { id: uuidv4(), title: 'TWK - Pancasila & UUD 1945', description: 'Materi lengkap tentang Pancasila dan UUD 1945', type: 'twk', pdf_url: '/uploads/sample.pdf', order: 1 },
      { id: uuidv4(), title: 'TIU - Numerik & Verbal', description: 'Latihan soal numerik dan verbal', type: 'tiu', pdf_url: '/uploads/sample.pdf', order: 2 },
      { id: uuidv4(), title: 'TKP - Pelayanan Publik', description: 'Karakteristik pribadi dalam pelayanan', type: 'tkp', pdf_url: '/uploads/sample.pdf', order: 3 },
    ];
    const insert = db.prepare(`INSERT INTO materials (id, title, description, type, pdf_url, "order") VALUES (?, ?, ?, ?, ?, ?)`);
    for (const m of sampleMaterials) {
      insert.run(m.id, m.title, m.description, m.type, m.pdf_url, m.order);
    }
    console.log('Sample materials inserted');
  }
};

createTables();

const JWT_SECRET = new TextEncoder().encode('ultron-super-secret-key-change-this-in-production');

const app = new Hono();
app.use('*', cors());

// Helper untuk get user from token
const getUserFromToken = async (token: string) => {
  try {
    const { payload } = await verify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
};

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.slice(7);
  const user = await getUserFromToken(token);
  if (!user) {
    return c.json({ error: 'Invalid token' }, 401);
  }
  c.set('userId', user.userId);
  c.set('userRole', user.role);
  c.set('username', user.username);
  await next();
};

// Admin middleware
const adminMiddleware = async (c: any, next: any) => {
  if (c.get('userRole') !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  await next();
};

// ==================== AUTH ====================
app.post('/api/auth/login', async (c) => {
  const { username, password } = await c.req.json();

  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  const user = db.prepare(
    'SELECT id, username, name, role, active FROM users WHERE username = ? AND hash = ? AND active = 1'
  ).get(username, hash) as any;

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const token = await new sign({ userId: user.id, username: user.username, role: user.role, exp: Math.floor(Date.now() / 1000) + 1800 })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(JWT_SECRET);

  db.prepare(
    `INSERT INTO activity_logs (user_id, action, detail, type, time) VALUES (?, ?, ?, ?, ?)`
  ).run(user.id, 'Login', `User ${user.username} logged in`, 'success', new Date().toISOString());

  return c.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
});

// ==================== USERS ====================
app.get('/api/users', authMiddleware, adminMiddleware, async (c) => {
  const users = db.prepare('SELECT id, name, username, role, active, created FROM users ORDER BY created DESC').all();
  return c.json(users);
});

app.post('/api/users', authMiddleware, adminMiddleware, async (c) => {
  const { name, username, password, role, active } = await c.req.json();

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return c.json({ error: 'Username already exists' }, 400);
  }

  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  const id = uuidv4();
  const created = new Date().toISOString();

  db.prepare(
    `INSERT INTO users (id, name, username, hash, role, active, created) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, name, username, hash, role, active ? 1 : 0, created);

  db.prepare(
    `INSERT INTO activity_logs (user_id, action, detail, type, time) VALUES (?, ?, ?, ?, ?)`
  ).run(c.get('userId'), 'Create User', `Created user: ${username}`, 'success', new Date().toISOString());

  return c.json({ id, name, username, role, active, created });
});

app.put('/api/users/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const { name, username, password, role, active } = await c.req.json();

  let query = 'UPDATE users SET name = ?, username = ?, role = ?, active = ?';
  const params: any[] = [name, username, role, active ? 1 : 0];

  if (password) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
    const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    query += ', hash = ?';
    params.push(hash);
  }

  query += ' WHERE id = ?';
  params.push(id);

  db.prepare(query).run(...params);
  return c.json({ success: true });
});

app.delete('/api/users/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return c.json({ success: true });
});

// ==================== LOGS ====================
app.get('/api/logs', authMiddleware, adminMiddleware, async (c) => {
  const limit = parseInt(c.req.query('limit') || '100');
  const logs = db.prepare(`
    SELECT l.*, u.username FROM activity_logs l 
    LEFT JOIN users u ON l.user_id = u.id 
    ORDER BY l.id DESC LIMIT ?
  `).all(limit);
  return c.json(logs);
});

app.delete('/api/logs', authMiddleware, adminMiddleware, async (c) => {
  db.prepare('DELETE FROM activity_logs').run();
  return c.json({ success: true });
});

// ==================== MATERIALS ====================
app.get('/api/materials', authMiddleware, async (c) => {
  const materials = db.prepare('SELECT * FROM materials ORDER BY "order" ASC').all();
  return c.json(materials);
});

app.post('/api/materials/:id/progress', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const { completed, score } = await c.req.json();
  const userId = c.get('userId');

  const existing = db.prepare(
    'SELECT * FROM user_progress WHERE user_id = ? AND material_id = ?'
  ).get(userId, id);

  if (existing) {
    db.prepare(
      `UPDATE user_progress SET completed = ?, score = ?, last_accessed = ? WHERE user_id = ? AND material_id = ?`
    ).run(completed ? 1 : 0, score || null, new Date().toISOString(), userId, id);
  } else {
    db.prepare(
      `INSERT INTO user_progress (user_id, material_id, completed, score, last_accessed) VALUES (?, ?, ?, ?, ?)`
    ).run(userId, id, completed ? 1 : 0, score || null, new Date().toISOString());
  }

  return c.json({ success: true });
});

// ==================== HEALTH ====================
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files for preview (build frontend)
app.get('*', async (c) => {
  const { existsSync } = await import('fs');
  const { join } = await import('path');
  const distPath = join(process.cwd(), '../client/dist/index.html');
  if (existsSync(distPath)) {
    const html = await import('fs/promises').then(fs => fs.readFile(distPath, 'utf-8'));
    return c.html(html);
  }
  return c.text('Frontend not built. Run npm run build first.', 404);
});

serve({ fetch: app.fetch, port: 3001 });
console.log('Server running on http://localhost:3001');
console.log('Admin login: admin / admin123');
