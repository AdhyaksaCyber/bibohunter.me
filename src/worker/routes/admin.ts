import { Hono as HonoAdmin } from 'hono';
import { createSuccessResponse as createSuccessResponseAdmin, createErrorResponse as createErrorResponseAdmin } from '../../utils/security';

const adminRoutes = new HonoAdmin();

// ---- LIST USERS ----
adminRoutes.get('/users', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '10', 10);

    // TODO: Verify admin role
    // TODO: Query users with pagination
    // TODO: Include role info

    return c.json(
      createSuccessResponseAdmin({
        users: [],
        total: 0,
        page,
        limit,
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseAdmin('Gagal mengambil data user', 'FETCH_ERROR'),
      { status: 500 }
    );
  }
});

// ---- CREATE USER ----
adminRoutes.post('/users', async (c) => {
  try {
    // TODO: Verify admin role
    const body = await c.req.json();
    const { username, email, password, fullName, role } = body;

    if (!username || !email || !password || !role) {
      return c.json(
        createErrorResponseAdmin('Username, email, password, role diperlukan', 'INVALID_INPUT'),
        { status: 400 }
      );
    }

    // TODO: Validate input
    // TODO: Hash password
    // TODO: Create user in DB
    // TODO: Assign role

    return c.json(
      createSuccessResponseAdmin({
        id: 'user-123',
        username,
        email,
        fullName,
        role,
      }),
      { status: 201 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseAdmin('Gagal membuat user', 'CREATE_ERROR'),
      { status: 500 }
    );
  }
});

// ---- UPDATE USER ----
adminRoutes.put('/users/:id', async (c) => {
  try {
    // TODO: Verify admin role
    const userId = c.req.param('id');
    const body = await c.req.json();

    // TODO: Validate input
    // TODO: Update user in DB

    return c.json(
      createSuccessResponseAdmin({
        message: 'User berhasil diupdate',
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseAdmin('Gagal mengupdate user', 'UPDATE_ERROR'),
      { status: 500 }
    );
  }
});

// ---- DELETE USER ----
adminRoutes.delete('/users/:id', async (c) => {
  try {
    // TODO: Verify admin role
    const userId = c.req.param('id');

    // TODO: Soft delete user in DB

    return c.json(
      createSuccessResponseAdmin({
        message: 'User berhasil dihapus',
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseAdmin('Gagal menghapus user', 'DELETE_ERROR'),
      { status: 500 }
    );
  }
});

// ---- LIST MATERI ----
adminRoutes.get('/materi', async (c) => {
  try {
    // TODO: Verify admin role
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '10', 10);

    // TODO: Query materi with pagination
    // TODO: Include upload info

    return c.json(
      createSuccessResponseAdmin({
        materi: [],
        total: 0,
        page,
        limit,
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseAdmin('Gagal mengambil data materi', 'FETCH_ERROR'),
      { status: 500 }
    );
  }
});

// ---- PUBLISH MATERI ----
adminRoutes.post('/materi/:id/publish', async (c) => {
  try {
    // TODO: Verify admin role
    const materiId = c.req.param('id');

    // TODO: Update status to 'published' in DB

    return c.json(
      createSuccessResponseAdmin({
        message: 'Materi berhasil dipublikasi',
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseAdmin('Gagal mempublikasi materi', 'UPDATE_ERROR'),
      { status: 500 }
    );
  }
});

// ---- LIST TRYOUT ----
adminRoutes.get('/tryout', async (c) => {
  try {
    // TODO: Verify admin role
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '10', 10);

    // TODO: Query tryout with pagination

    return c.json(
      createSuccessResponseAdmin({
        tryouts: [],
        total: 0,
        page,
        limit,
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseAdmin('Gagal mengambil data tryout', 'FETCH_ERROR'),
      { status: 500 }
    );
  }
});

// ---- PUBLISH TRYOUT ----
adminRoutes.post('/tryout/:id/publish', async (c) => {
  try {
    // TODO: Verify admin role
    const tryoutId = c.req.param('id');

    // TODO: Update status to 'published' in DB

    return c.json(
      createSuccessResponseAdmin({
        message: 'Tryout berhasil dipublikasi',
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseAdmin('Gagal mempublikasi tryout', 'UPDATE_ERROR'),
      { status: 500 }
    );
  }
});

// ---- GET STATS ----
adminRoutes.get('/stats', async (c) => {
  try {
    // TODO: Verify admin role
    // TODO: Query stats from DB

    return c.json(
      createSuccessResponseAdmin({
        totalUsers: 0,
        totalMateri: 0,
        totalTryout: 0,
        totalSubmissions: 0,
        averageScore: 0,
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseAdmin('Gagal mengambil stats', 'FETCH_ERROR'),
      { status: 500 }
    );
  }
});

export default adminRoutes;
