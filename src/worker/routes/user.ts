import { Hono as HonoUser } from 'hono';
import { createSuccessResponse as createSuccessResponseUser, createErrorResponse as createErrorResponseUser } from '../../utils/security';

const userRoutes = new HonoUser();

// ---- GET PROFILE ----
userRoutes.get('/profile', async (c) => {
  try {
    // TODO: Get userId from JWT token
    // TODO: Query user from DB
    // TODO: Include role and permissions

    return c.json(
      createSuccessResponseUser({
        id: 'user-1',
        username: 'user@example.com',
        fullName: 'User Name',
        email: 'user@example.com',
        phoneNumber: '+62812345678',
        role: 'user',
        createdAt: new Date().toISOString(),
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseUser('Gagal mengambil profile', 'FETCH_ERROR'),
      { status: 500 }
    );
  }
});

// ---- UPDATE PROFILE ----
userRoutes.put('/profile', async (c) => {
  try {
    const body = await c.req.json();
    const { fullName, phoneNumber } = body;

    // TODO: Get userId from JWT
    // TODO: Validate input
    // TODO: Update user in DB
    // TODO: Return updated profile

    return c.json(
      createSuccessResponseUser({
        message: 'Profile berhasil diupdate',
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseUser('Gagal mengupdate profile', 'UPDATE_ERROR'),
      { status: 500 }
    );
  }
});

// ---- CHANGE PASSWORD ----
userRoutes.post('/change-password', async (c) => {
  try {
    const body = await c.req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return c.json(
        createErrorResponseUser('Current password dan new password diperlukan', 'INVALID_INPUT'),
        { status: 400 }
      );
    }

    // TODO: Get userId from JWT
    // TODO: Verify current password
    // TODO: Hash new password
    // TODO: Update in DB
    // TODO: Invalidate all sessions

    return c.json(
      createSuccessResponseUser({
        message: 'Password berhasil diubah',
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseUser('Gagal mengubah password', 'UPDATE_ERROR'),
      { status: 500 }
    );
  }
});

// ---- GET PROGRESS ----
userRoutes.get('/progress', async (c) => {
  try {
    // TODO: Get userId from JWT
    // TODO: Query hasil_tryout
    // TODO: Calculate stats

    return c.json(
      createSuccessResponseUser({
        totalTryout: 5,
        completedTryout: 4,
        averageScore: 78.5,
        bestScore: 92,
        worstScore: 65,
        recentTryout: [],
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseUser('Gagal mengambil progress', 'FETCH_ERROR'),
      { status: 500 }
    );
  }
});

// ---- GET TRYOUT HISTORY ----
userRoutes.get('/history', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '10', 10);

    // TODO: Get userId from JWT
    // TODO: Query hasil_tryout with pagination
    // TODO: Include tryout details

    return c.json(
      createSuccessResponseUser({
        history: [],
        total: 0,
        page,
        limit,
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseUser('Gagal mengambil history', 'FETCH_ERROR'),
      { status: 500 }
    );
  }
});

// ---- GET LEADERBOARD ----
userRoutes.get('/leaderboard', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10', 10);

    // TODO: Query hasil_tryout ordered by score
    // TODO: Get top performers
    // TODO: Include user info

    return c.json(
      createSuccessResponseUser({
        leaderboard: [],
        total: 0,
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponseUser('Gagal mengambil leaderboard', 'FETCH_ERROR'),
      { status: 500 }
    );
  }
});

export default userRoutes;
