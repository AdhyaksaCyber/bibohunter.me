import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { 
  JWTManager, 
  PasswordManager, 
  InputValidator, 
  RateLimiter, 
  createSuccessResponse, 
  createErrorResponse 
} from '../../utils/security';
// Database schema import (uncomment saat schema sudah setup)
// import { users, roles, sessions } from '../../../database/schema';

const authRoutes = new Hono<{
  Bindings: {
    DB?: D1Database;
    JWT_SECRET: string;
    MAX_LOGIN_ATTEMPT: string;
    LOCK_DURATION_SEC: string;
    JWT_EXPIRES_IN: string;
  };
}>();

const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

// ──── LOGIN ────
authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { username, password } = body;

    // Input validation
    if (!username || !password) {
      return c.json(
        createErrorResponse('Username dan password diperlukan', 'INVALID_INPUT'),
        { status: 400 }
      );
    }

    // Rate limiting per username
    const ip = c.req.header('cf-connecting-ip') || 'unknown';
    const rateLimitKey = `login:${username}`;
    const attempt = loginAttempts.get(rateLimitKey);
    const maxAttempts = parseInt(c.env.MAX_LOGIN_ATTEMPT || '5', 10);
    const lockDuration = parseInt(c.env.LOCK_DURATION_SEC || '60', 10) * 1000;

    if (attempt && attempt.lockedUntil > Date.now()) {
      const remainingSeconds = Math.ceil((attempt.lockedUntil - Date.now()) / 1000);
      return c.json(
        createErrorResponse(
          `Terlalu banyak percobaan. Coba lagi dalam ${remainingSeconds} detik`,
          'TOO_MANY_ATTEMPTS'
        ),
        { status: 429 }
      );
    }

    if (!attempt || attempt.lockedUntil < Date.now()) {
      loginAttempts.set(rateLimitKey, { count: 0, lockedUntil: 0 });
    }

    // Simulate timing-safe delay
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

    // Fetch user from DB
    // NOTE: Uncomment saat DB sudah connected
    // const user = await c.env.DB?.prepare(
    //   'SELECT * FROM users WHERE username = ?'
    // ).bind(username).first();

    const jwtManager = new JWTManager(c.env.JWT_SECRET, parseInt(c.env.JWT_EXPIRES_IN || '900', 10));

    // Placeholder - replace dengan DB query sebenarnya
    const user = { id: 'user-1', username: 'admin', roleId: 'role-1' };
    const role = { id: 'role-1', name: 'admin' };

    // Generate tokens
    const accessToken = await jwtManager.sign({
      userId: user.id,
      username: user.username,
      role: role.name,
    });

    // Reset login attempts
    loginAttempts.delete(rateLimitKey);

    return c.json(
      createSuccessResponse({
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          role: role.name,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);

    // Track failed attempt
    const body = await c.req.json().catch(() => ({ username: 'unknown' }));
    const rateLimitKey = `login:${body.username}`;
    const attempt = loginAttempts.get(rateLimitKey) || { count: 0, lockedUntil: 0 };

    attempt.count++;

    const maxAttempts = parseInt(c.env.MAX_LOGIN_ATTEMPT || '5', 10);
    const lockDuration = parseInt(c.env.LOCK_DURATION_SEC || '60', 10) * 1000;

    if (attempt.count >= maxAttempts) {
      attempt.lockedUntil = Date.now() + lockDuration;
    }

    loginAttempts.set(rateLimitKey, attempt);

    return c.json(
      createErrorResponse('Username atau password salah', 'INVALID_CREDENTIALS'),
      { status: 401 }
    );
  }
});

// ──── REGISTER ────
authRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const { username, email, password, fullName } = body;

    // Validation
    if (!username || !email || !password) {
      return c.json(
        createErrorResponse('Username, email, dan password diperlukan', 'INVALID_INPUT'),
        { status: 400 }
      );
    }

    if (!InputValidator.validateUsername(username)) {
      return c.json(
        createErrorResponse('Username hanya boleh mengandung huruf, angka, - dan _ (3-20 karakter)', 'INVALID_USERNAME'),
        { status: 400 }
      );
    }

    if (!InputValidator.validateEmail(email)) {
      return c.json(
        createErrorResponse('Email tidak valid', 'INVALID_EMAIL'),
        { status: 400 }
      );
    }

    const passwordStrength = PasswordManager.isStrong(password);
    if (!passwordStrength.isStrong) {
      return c.json(
        createErrorResponse('Password tidak kuat', 'WEAK_PASSWORD', { feedback: passwordStrength.feedback }),
        { status: 400 }
      );
    }

    // TODO: Check if user exists in DB
    // TODO: Hash password
    // TODO: Create user in DB
    // TODO: Return success

    return c.json(
      createSuccessResponse(
        { message: 'Registrasi berhasil. Silakan login.' },
        'User berhasil dibuat'
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return c.json(
      createErrorResponse('Gagal melakukan registrasi', 'REGISTRATION_FAILED'),
      { status: 500 }
    );
  }
});

// ──── REFRESH TOKEN ────
authRoutes.post('/refresh', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        createErrorResponse('Token tidak ditemukan', 'NO_TOKEN'),
        { status: 401 }
      );
    }

    const refreshToken = authHeader.substring(7);

    // TODO: Verify refresh token
    // TODO: Check if refresh token valid in DB
    // TODO: Generate new access token
    // TODO: Return new token

    const jwtManager = new JWTManager(c.env.JWT_SECRET, parseInt(c.env.JWT_EXPIRES_IN || '900', 10));
    const newAccessToken = await jwtManager.sign({
      userId: 'user-id',
      username: 'username',
      role: 'user',
    });

    return c.json(
      createSuccessResponse({ accessToken: newAccessToken }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Refresh error:', error);
    return c.json(
      createErrorResponse('Gagal me-refresh token', 'REFRESH_FAILED'),
      { status: 401 }
    );
  }
});

// ──── LOGOUT ────
authRoutes.post('/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
      return c.json(
        createSuccessResponse({ message: 'Logout berhasil' }),
        { status: 200 }
      );
    }

    // TODO: Invalidate token in DB
    // TODO: Clear session

    return c.json(
      createSuccessResponse({ message: 'Logout berhasil' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return c.json(
      createErrorResponse('Gagal logout', 'LOGOUT_FAILED'),
      { status: 500 }
    );
  }
});

// ──── VERIFY TOKEN ────
authRoutes.get('/verify', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        createErrorResponse('Token tidak valid', 'INVALID_TOKEN'),
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const jwtManager = new JWTManager(c.env.JWT_SECRET);

    const payload = await jwtManager.verify(token);

    return c.json(
      createSuccessResponse({
        valid: true,
        user: {
          userId: payload.userId,
          username: payload.username,
          role: payload.role,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    return c.json(
      createErrorResponse('Token tidak valid', 'INVALID_TOKEN'),
      { status: 401 }
    );
  }
});

export default authRoutes;
