// src/config/api.ts

/**
 * Get API URL based on environment
 * Priority: 1) VITE_API_URL env var, 2) Same origin (production), 3) Localhost (dev)
 */
export const getApiUrl = (): string => {
  // Explicit environment variable (highest priority)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Production: API is same origin
  if (import.meta.env.PROD) {
    return `${window.location.origin}/api`;
  }

  // Development fallback
  return 'http://localhost:8787/api';
};

/**
 * API client configuration
 */
export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
} as const;

/**
 * Make authenticated API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Request failed',
      code: 'UNKNOWN_ERROR'
    }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}