import * as jose from 'jose';
import bcryptjs from 'bcryptjs';
import validator from 'validator';
import { sanitizeHtml } from 'sanitize-html';
import DOMPurify from 'dompurify';
import { z } from 'zod';

// ──── JWT HANDLING ────
export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export class JWTManager {
  private secret: Uint8Array;
  private expiresIn: number;

  constructor(secretKey: string, expiresInSeconds: number = 900) {
    this.secret = new TextEncoder().encode(secretKey);
    this.expiresIn = expiresInSeconds;
  }

  async sign(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${this.expiresIn}s`)
      .sign(this.secret);

    return token;
  }

  async verify(token: string): Promise<JWTPayload> {
    try {
      const verified = await jose.jwtVerify(token, this.secret);
      return verified.payload as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

// ──── PASSWORD HASHING ────
export class PasswordManager {
  static async hash(password: string, rounds: number = 12): Promise<string> {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    return bcryptjs.hash(password, rounds);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  }

  static isStrong(password: string): {
    isStrong: boolean;
    feedback: string[];
  } {
    const feedback: string[] = [];

    if (password.length < 8) {
      feedback.push('Password harus minimal 8 karakter');
    }
    if (!/[A-Z]/.test(password)) {
      feedback.push('Password harus mengandung huruf besar');
    }
    if (!/[a-z]/.test(password)) {
      feedback.push('Password harus mengandung huruf kecil');
    }
    if (!/[0-9]/.test(password)) {
      feedback.push('Password harus mengandung angka');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      feedback.push('Password harus mengandung karakter spesial (!@#$%^&*)');
    }

    return {
      isStrong: feedback.length === 0,
      feedback,
    };
  }
}

// ──── INPUT VALIDATION ────
export class InputValidator {
  static validateUsername(username: string): boolean {
    return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
  }

  static validateEmail(email: string): boolean {
    return validator.isEmail(email);
  }

  static validatePhoneNumber(phone: string): boolean {
    return /^(\+62|0)[0-9]{9,12}$/.test(phone);
  }

  static validateFileSize(sizeInBytes: number, maxSizeInBytes: number): boolean {
    return sizeInBytes <= maxSizeInBytes;
  }

  static validateMimeType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType);
  }

  static validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return allowedExtensions.includes(`.${ext}`);
  }

  static sanitizeInput(input: string, maxLength: number = 1000): string {
    let sanitized = validator.trim(input);
    sanitized = validator.escape(sanitized);

    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }
}

// ──── HTML SANITIZATION ────
export function sanitizeHtmlContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'a', 'code', 'pre'],
    allowedAttributes: {
      a: ['href', 'title'],
      code: ['class'],
      pre: ['class'],
    },
    disallowedTagsMode: 'discard',
  });
}

// Node.js environments don't have DOMPurify, use the server-side alternative
export function sanitizeDOMContent(html: string): string {
  // Use sanitize-html for Node.js/server environments
  return sanitizeHtmlContent(html);
}

// ──── COMMON VALIDATION SCHEMAS (Zod) ────
export const LoginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(100),
});

export const RegisterSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  fullName: z.string().optional(),
});

export const MaterialUploadSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  categoryId: z.string().uuid(),
  fileType: z.enum(['pdf', 'docx']),
});

export const TryoutSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  durationMinutes: z.number().int().positive(),
  totalSoal: z.number().int().positive(),
  passingScore: z.number().min(0).max(100).optional(),
});

export const CreateSoalSchema = z.object({
  tryoutId: z.string().uuid(),
  questionNumber: z.number().int().positive(),
  pertanyaan: z.string().min(10),
  tipeJawaban: z.enum(['pilihan_ganda', 'essay']),
  opsiA: z.string().optional(),
  opsiB: z.string().optional(),
  opsiC: z.string().optional(),
  opsiD: z.string().optional(),
  opsiE: z.string().optional(),
  jawabanBenar: z.enum(['A', 'B', 'C', 'D', 'E']).optional(),
  pembahasan: z.string().optional(),
  kategori: z.string().optional(),
});

// ──── SECURITY HEADERS ────
export const SECURE_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// ──── RATE LIMITING ────
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const recentAttempts = attempts.filter((time) => now - time < this.windowMs);

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    return true;
  }

  getRemainingAttempts(key: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    const recentAttempts = attempts.filter((time) => now - time < this.windowMs);

    return Math.max(0, this.maxAttempts - recentAttempts.length);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// ──── CSRF TOKEN ────
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// ──── API ERROR RESPONSE ────
export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: Record<string, any>;
}

export function createErrorResponse(
  message: string,
  code: string = 'INTERNAL_ERROR',
  details?: Record<string, any>
): ApiErrorResponse {
  return {
    success: false,
    error: message,
    code,
    details,
  };
}

// ──── API SUCCESS RESPONSE ────
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export function createSuccessResponse<T>(data: T, message?: string): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}
