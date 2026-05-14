import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export interface User {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  role: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,

      login: async (username: string, password: string) => {
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            username,
            password,
          });

          const { accessToken, user } = response.data.data;

          set({
            isAuthenticated: true,
            user,
            accessToken,
          });

          // Set default auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } catch (error: any) {
          const message = error.response?.data?.error || 'Login gagal';
          throw new Error(message);
        }
      },

      register: async (username: string, email: string, password: string, fullName?: string) => {
        try {
          await axios.post(`${API_URL}/auth/register`, {
            username,
            email,
            password,
            fullName,
          });
        } catch (error: any) {
          const message = error.response?.data?.error || 'Registrasi gagal';
          throw new Error(message);
        }
      },

      logout: async () => {
        try {
          await axios.post(`${API_URL}/auth/logout`);
        } catch (error) {
          console.error('Logout error:', error);
        }

        // Clear state
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });

        // Clear auth header
        delete axios.defaults.headers.common['Authorization'];

        // Clear localStorage
        localStorage.removeItem('auth-storage');
      },

      checkAuth: async () => {
        try {
          const state = get();

          if (!state.accessToken) {
            set({ isAuthenticated: false, user: null });
            return;
          }

          // Verify token
          const response = await axios.get(`${API_URL}/auth/verify`, {
            headers: {
              Authorization: `Bearer ${state.accessToken}`,
            },
          });

          if (response.data.data.valid) {
            set({ isAuthenticated: true });
            axios.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`;
          } else {
            set({ isAuthenticated: false, user: null, accessToken: null });
          }
        } catch (error) {
          // Token invalid or expired
          set({ isAuthenticated: false, user: null, accessToken: null });
        }
      },

      refreshAccessToken: async () => {
        try {
          const state = get();

          if (!state.refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
            headers: {
              Authorization: `Bearer ${state.refreshToken}`,
            },
          });

          const { accessToken } = response.data.data;

          set({ accessToken });
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } catch (error) {
          // Refresh failed, logout user
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
          });

          throw error;
        }
      },

      setUser: (user: User | null) => {
        set({ user });
      },
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

// Setup axios interceptor for token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and not already retrying
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      useAuthStore.getState().refreshToken
    ) {
      originalRequest._retry = true;

      try {
        await useAuthStore.getState().refreshAccessToken();
        return axios(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
