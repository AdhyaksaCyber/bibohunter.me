import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { v4 as uuidv4 } from 'uuid';

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  JWT_SECRET: string;
};

type Variables = {
  userId: string;
  userRole: string;
  username: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// CORS
app.use('*', cors());

// Database helper
const getDb = (c: any) => c.env.DB;

// JWT Middleware
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.slice(7);
  try {
    const payload = await jwt.verify(token, c.env.JWT_SECRET);
    c.set('userId', payload.userId);
    c.set('userRole', payload.role);
    c.set('username', payload.username);
    await next();
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// Admin middleware
const adminMiddleware = async (c: any, next: any) => {
  if (c.get('userRole') !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  await next();
};

// ==================== AUTH ROUTES ====================
app.post('/api/auth/login', async (c) => {
  const { username, password } = await c.req.json();
  const db = getDb(c);

  // Hash password dengan SHA-256 (sesuai dengan yang di database)
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  const user = await db.prepare(
    'SELECT id, username, name, role, active FROM users WHERE username = ? AND hash = ? AND active = 1'
  ).bind(username, hash).first();

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Generate JWT token
  const token = await jwt.sign(
    { userId: user.id, username: user.username, role: user.role, exp: Math.floor(Date.now() / 1000) + 1800 },
    c.env.JWT_SECRET
  );

  // Log activity
  await db.prepare(
    `INSERT INTO activity_logs (user_id, action, detail, type, time) VALUES (?, ?, ?, ?, ?)`
  ).bind(user.id, 'Login', `User ${user.username} logged in`, 'success', new Date().toISOString()).run();

  return c.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
});

// ==================== USER ROUTES (Admin only) ====================
app.get('/api/users', authMiddleware, adminMiddleware, async (c) => {
  const db = getDb(c);
  const users = await db.prepare('SELECT id, name, username, role, active, created FROM users ORDER BY created DESC').all();
  return c.json(users.results);
});

app.post('/api/users', authMiddleware, adminMiddleware, async (c) => {
  const { name, username, password, role, active } = await c.req.json();
  const db = getDb(c);

  // Check existing
  const existing = await db.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
  if (existing) {
    return c.json({ error: 'Username already exists' }, 400);
  }

  // Hash password
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  const id = uuidv4();
  const created = new Date().toISOString();

  await db.prepare(
    `INSERT INTO users (id, name, username, hash, role, active, created) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, name, username, hash, role, active ? 1 : 0, created).run();

  // Log
  await db.prepare(
    `INSERT INTO activity_logs (user_id, action, detail, type, time) VALUES (?, ?, ?, ?, ?)`
  ).bind(c.get('userId'), 'Create User', `Created user: ${username}`, 'success', new Date().toISOString()).run();

  return c.json({ id, name, username, role, active, created });
});

app.put('/api/users/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const { name, username, password, role, active } = await c.req.json();
  const db = getDb(c);

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

  await db.prepare(query).bind(...params).run();

  return c.json({ success: true });
});

app.delete('/api/users/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const db = getDb(c);
  await db.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// ==================== LOGS ROUTES ====================
app.get('/api/logs', authMiddleware, adminMiddleware, async (c) => {
  const db = getDb(c);
  const limit = parseInt(c.req.query('limit') || '100');
  const logs = await db.prepare(
    `SELECT l.*, u.username FROM activity_logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.id DESC LIMIT ?`
  ).bind(limit).all();
  return c.json(logs.results);
});

app.delete('/api/logs', authMiddleware, adminMiddleware, async (c) => {
  const db = getDb(c);
  await db.prepare('DELETE FROM activity_logs').run();
  return c.json({ success: true });
});

// ==================== MATERIALS ROUTES ====================
app.get('/api/materials', authMiddleware, async (c) => {
  const db = getDb(c);
  const materials = await db.prepare('SELECT * FROM materials ORDER BY "order" ASC').all();
  return c.json(materials.results);
});

app.post('/api/materials/:id/progress', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const { completed, score } = await c.req.json();
  const userId = c.get('userId');
  const db = getDb(c);

  const existing = await db.prepare(
    'SELECT * FROM user_progress WHERE user_id = ? AND material_id = ?'
  ).bind(userId, id).first();

  if (existing) {
    await db.prepare(
      `UPDATE user_progress SET completed = ?, score = ?, last_accessed = ? WHERE user_id = ? AND material_id = ?`
    ).bind(completed ? 1 : 0, score || null, new Date().toISOString(), userId, id).run();
  } else {
    await db.prepare(
      `INSERT INTO user_progress (user_id, material_id, completed, score, last_accessed) VALUES (?, ?, ?, ?, ?)`
    ).bind(userId, id, completed ? 1 : 0, score || null, new Date().toISOString()).run();
  }

  return c.json({ success: true });
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
