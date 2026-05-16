// src/worker/types.ts
export interface Env {
  // D1 Database Binding
  DB: D1Database;
  
  // R2 Storage Binding
  R2: R2Bucket;
  
  // Analytics Engine (optional)
  ANALYTICS?: AnalyticsEngineDataset;
  
  // SECRETS (set via wrangler secret put)
  JWT_SECRET: string;
  REFRESH_SECRET: string;
  ALERT_WEBHOOK_URL?: string;
  
  // Environment Variables
  ENVIRONMENT: 'development' | 'production';
  API_URL: string;
  FRONTEND_URL: string;
  JWT_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES: string;
  MAX_LOGIN_ATTEMPT: string;
  LOCK_DURATION_SEC: string;
  MAX_UPLOAD_SIZE: string;
  RATE_LIMIT_WINDOW: string;
  RATE_LIMIT_MAX: string;
  PASSWORD_MIN_LENGTH: string;
}

// Custom Request metadata
export interface RequestMetadata {
  startTime: number;
  ip?: string;
  country?: string;
}

// Extend Request type
declare global {
  interface Request {
    metadata?: RequestMetadata;
  }
}

// Rate limit record
export interface RateLimitRecord {
  ip: string;
  count: number;
  window_start: number;
}

// Login attempt record
export interface LoginAttemptRecord {
  email: string;
  ip: string;
  failed_attempts: number;
  last_failed_at: number;
  locked_until: number | null;
}

// Alert payload
export interface AlertPayload {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  status: number;
  url: string;
  metadata?: Record<string, any>;
}