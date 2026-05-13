import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { v4 as uuidv4 } from 'uuid';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

type Variables = {
  userId: string;
  userRole: string;
  username: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();
app.use('*', cors());

// ==================== HEALTH CHECK ====================
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Ultron Bimbel API is running'
  });
});

// ==================== AUTH LOGIN ====================
app.post('/api/auth/login', async (c) => {
  const { username, password } = await c.req.json();

  if (!username || !password) {
    return c.json({ error: 'Username and password required' }, 400);
  }

  // Hash password dengan SHA-256
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Cari user di database
  const user = await c.env.DB.prepare(
    `SELECT id, username, name, role, active 
     FROM users 
     WHERE username = ? AND hash = ? AND active = 1`
  ).bind(username, hash).first();

  if (!user) {
    return c.json({ error: 'Invalid username or password' }, 401);
  }

  // Generate JWT token (expired 30 menit)
  const token = await jwt.sign(
    { 
      userId: user.id, 
      username: user.username, 
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (30 * 60) // 30 menit
    },
    c.env.JWT_SECRET
  );

  // Catat activity log
  await c.env.DB.prepare(
    `INSERT INTO activity_logs (user_id, action, detail, type, time) 
     VALUES (?, ?, ?, ?, ?)`
  ).bind(
    user.id, 
    'LOGIN', 
    `User ${user.username} logged in successfully`, 
    'success', 
    new Date().toISOString()
  ).run();

  return c.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
});

// ==================== MIDDLEWARE AUTH ====================
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await jwt.verify(token, c.env.JWT_SECRET);
    c.set('userId', payload.userId);
    c.set('userRole', payload.role);
    c.set('username', payload.username);
    await next();
  } catch (err) {
    return c.json({ error: 'Unauthorized: Invalid or expired token' }, 401);
  }
};

const adminMiddleware = async (c: any, next: any) => {
  if (c.get('userRole') !== 'admin') {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }
  await next();
};

// ==================== USERS CRUD (Admin only) ====================

// GET all users
app.get('/api/users', authMiddleware, adminMiddleware, async (c) => {
  const users = await c.env.DB.prepare(
    `SELECT id, name, username, role, active, created 
     FROM users 
     ORDER BY created DESC`
  ).all();

  return c.json(users.results);
});

// GET user by ID
app.get('/api/users/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');

  const user = await c.env.DB.prepare(
    `SELECT id, name, username, role, active, created 
     FROM users 
     WHERE id = ?`
  ).bind(id).first();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(user);
});

// CREATE user
app.post('/api/users', authMiddleware, adminMiddleware, async (c) => {
  const { name, username, password, role, active } = await c.req.json();

  // Validasi
  if (!name || !username || !password) {
    return c.json({ error: 'Name, username, and password are required' }, 400);
  }

  if (username.length < 3) {
    return c.json({ error: 'Username must be at least 3 characters' }, 400);
  }

  if (password.length < 6) {
    return c.json({ error: 'Password must be at least 6 characters' }, 400);
  }

  // Cek username sudah ada?
  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE username = ?'
  ).bind(username).first();

  if (existing) {
    return c.json({ error: 'Username already exists' }, 400);
  }

  // Hash password
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const id = uuidv4();
  const created = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO users (id, name, username, hash, role, active, created) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, name, username, hash, role || 'user', active !== false ? 1 : 0, created).run();

  // Activity log
  await c.env.DB.prepare(
    `INSERT INTO activity_logs (user_id, action, detail, type, time) 
     VALUES (?, ?, ?, ?, ?)`
  ).bind(
    c.get('userId'),
    'CREATE_USER',
    `Created user: ${username} (${role || 'user'})`,
    'success',
    new Date().toISOString()
  ).run();

  return c.json({
    success: true,
    user: { id, name, username, role: role || 'user', active: active !== false, created }
  });
});

// UPDATE user
app.put('/api/users/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const { name, username, password, role, active } = await c.req.json();

  let query = 'UPDATE users SET name = ?, username = ?, role = ?, active = ?';
  const params: any[] = [name, username, role, active ? 1 : 0];

  if (password && password.length > 0) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    query += ', hash = ?';
    params.push(hash);
  }

  query += ' WHERE id = ?';
  params.push(id);

  await c.env.DB.prepare(query).bind(...params).run();

  // Activity log
  await c.env.DB.prepare(
    `INSERT INTO activity_logs (user_id, action, detail, type, time) 
     VALUES (?, ?, ?, ?, ?)`
  ).bind(
    c.get('userId'),
    'UPDATE_USER',
    `Updated user: ${username}`,
    'success',
    new Date().toISOString()
  ).run();

  return c.json({ success: true });
});

// DELETE user
app.delete('/api/users/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');

  // Jangan biarkan admin menghapus diri sendiri
  if (id === c.get('userId')) {
    return c.json({ error: 'Cannot delete your own account' }, 400);
  }

  await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();

  // Activity log
  await c.env.DB.prepare(
    `INSERT INTO activity_logs (user_id, action, detail, type, time) 
     VALUES (?, ?, ?, ?, ?)`
  ).bind(
    c.get('userId'),
    'DELETE_USER',
    `Deleted user ID: ${id}`,
    'success',
    new Date().toISOString()
  ).run();

  return c.json({ success: true });
});

// TOGGLE user status
app.patch('/api/users/:id/toggle', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');

  // Get current status
  const user = await c.env.DB.prepare('SELECT active FROM users WHERE id = ?').bind(id).first();
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  const newStatus = user.active === 1 ? 0 : 1;
  await c.env.DB.prepare('UPDATE users SET active = ? WHERE id = ?').bind(newStatus, id).run();

  return c.json({ success: true, active: newStatus === 1 });
});

// ==================== ACTIVITY LOGS ====================

// GET logs
app.get('/api/logs', authMiddleware, adminMiddleware, async (c) => {
  const limit = parseInt(c.req.query('limit') || '100');
  const logs = await c.env.DB.prepare(
    `SELECT l.*, u.username 
     FROM activity_logs l 
     LEFT JOIN users u ON l.user_id = u.id 
     ORDER BY l.id DESC 
     LIMIT ?`
  ).bind(limit).all();

  return c.json(logs.results);
});

// DELETE all logs
app.delete('/api/logs', authMiddleware, adminMiddleware, async (c) => {
  await c.env.DB.prepare('DELETE FROM activity_logs').run();

  return c.json({ success: true, message: 'All logs cleared' });
});

// ==================== MATERIALS ====================

// GET all materials
app.get('/api/materials', authMiddleware, async (c) => {
  const materials = await c.env.DB.prepare(
    `SELECT id, title, description, type, pdf_url, "order" 
     FROM materials 
     ORDER BY "order" ASC`
  ).all();

  return c.json(materials.results);
});

// GET single material
app.get('/api/materials/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');

  const material = await c.env.DB.prepare(
    `SELECT id, title, description, type, pdf_url, "order" 
     FROM materials 
     WHERE id = ?`
  ).bind(id).first();

  if (!material) {
    return c.json({ error: 'Material not found' }, 404);
  }

  return c.json(material);
});

// CREATE material (admin only)
app.post('/api/materials', authMiddleware, adminMiddleware, async (c) => {
  const { title, description, type, pdf_url, order } = await c.req.json();

  if (!title || !description || !type || !pdf_url) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  const id = uuidv4();
  const orderNum = order || 0;

  await c.env.DB.prepare(
    `INSERT INTO materials (id, title, description, type, pdf_url, "order") 
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(id, title, description, type, pdf_url, orderNum).run();

  return c.json({ success: true, id });
});

// UPDATE material (admin only)
app.put('/api/materials/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const { title, description, type, pdf_url, order } = await c.req.json();

  await c.env.DB.prepare(
    `UPDATE materials 
     SET title = ?, description = ?, type = ?, pdf_url = ?, "order" = ? 
     WHERE id = ?`
  ).bind(title, description, type, pdf_url, order, id).run();

  return c.json({ success: true });
});

// DELETE material (admin only)
app.delete('/api/materials/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');

  await c.env.DB.prepare('DELETE FROM materials WHERE id = ?').bind(id).run();

  return c.json({ success: true });
});

// ==================== USER PROGRESS ====================

// GET user progress
app.get('/api/progress', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const progress = await c.env.DB.prepare(
    `SELECT material_id, completed, score, last_accessed 
     FROM user_progress 
     WHERE user_id = ?`
  ).bind(userId).all();

  return c.json(progress.results);
});

// UPDATE progress
app.post('/api/progress/:materialId', authMiddleware, async (c) => {
  const materialId = c.req.param('materialId');
  const { completed, score } = await c.req.json();
  const userId = c.get('userId');

  // Cek apakah sudah ada
  const existing = await c.env.DB.prepare(
    'SELECT * FROM user_progress WHERE user_id = ? AND material_id = ?'
  ).bind(userId, materialId).first();

  if (existing) {
    await c.env.DB.prepare(
      `UPDATE user_progress 
       SET completed = ?, score = ?, last_accessed = ? 
       WHERE user_id = ? AND material_id = ?`
    ).bind(completed ? 1 : 0, score || null, new Date().toISOString(), userId, materialId).run();
  } else {
    await c.env.DB.prepare(
      `INSERT INTO user_progress (user_id, material_id, completed, score, last_accessed) 
       VALUES (?, ?, ?, ?, ?)`
    ).bind(userId, materialId, completed ? 1 : 0, score || null, new Date().toISOString()).run();
  }

  return c.json({ success: true });
});

// ==================== DASHBOARD STATS ====================
app.get('/api/stats', authMiddleware, adminMiddleware, async (c) => {
  // Total users
  const totalUsers = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
  
  // Active users
  const activeUsers = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE active = 1').first();
  
  // Admin users
  const adminUsers = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE role = "admin"').first();
  
  // Total materials
  const totalMaterials = await c.env.DB.prepare('SELECT COUNT(*) as count FROM materials').first();

  return c.json({
    totalUsers: totalUsers?.count || 0,
    activeUsers: activeUsers?.count || 0,
    adminUsers: adminUsers?.count || 0,
    totalMaterials: totalMaterials?.count || 0
  });
});

// ==================== LOGOUT ====================
app.post('/api/auth/logout', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const username = c.get('username');

  await c.env.DB.prepare(
    `INSERT INTO activity_logs (user_id, action, detail, type, time) 
     VALUES (?, ?, ?, ?, ?)`
  ).bind(
    userId,
    'LOGOUT',
    `User ${username} logged out`,
    'success',
    new Date().toISOString()
  ).run();

  return c.json({ success: true, message: 'Logged out successfully' });
});

// ==================== 404 HANDLER ====================
app.notFound((c) => {
  return c.json({ error: 'API endpoint not found' }, 404);
});

export default app;
