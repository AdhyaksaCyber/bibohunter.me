import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getApiUrl } from '@/config/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;

  login: (email: string, password: string, recaptchaToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,

      login: async (email: string, password: string, recaptchaToken: string) => {
        const API_URL = getApiUrl();
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, recaptchaToken }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Login gagal');
        }

        // Worker returns: { success, accessToken, refreshToken, expiresIn, user }
        set({
          isAuthenticated: true,
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      },

      logout: async () => {
        const { accessToken } = get();
        const API_URL = getApiUrl();

        try {
          if (accessToken) {
            await fetch(`${API_URL}/auth/logout`, {
              method: 'POST',
              headers: getAuthHeaders(accessToken),
            });
          }
        } catch {
          // ignore logout errors
        }

        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },

      checkAuth: () => {
        // Cukup cek apakah token ada di storage — verifikasi async dilakukan saat request
        const { accessToken } = get();
        if (!accessToken) {
          set({ isAuthenticated: false, user: null });
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        const API_URL = getApiUrl();

        if (!refreshToken) {
          set({ isAuthenticated: false, user: null, accessToken: null, refreshToken: null });
          throw new Error('No refresh token');
        }

        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        const data = await res.json();

        if (!res.ok) {
          set({ isAuthenticated: false, user: null, accessToken: null, refreshToken: null });
          throw new Error(data.error || 'Refresh gagal');
        }

        set({ accessToken: data.accessToken });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);