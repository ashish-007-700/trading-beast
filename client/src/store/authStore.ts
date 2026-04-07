import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = 'http://localhost:5000/api/auth';

export interface User {
  _id: string;
  email: string;
  name: string;
  preferences: {
    alertsEnabled: boolean;
    emailNotifications: boolean;
    tradingSessionAlerts: {
      tokyo: boolean;
      london: boolean;
      newYork: boolean;
      sydney: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
  fetchUser: () => Promise<void>;
  updatePreferences: (preferences: User['preferences']) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            set({ isLoading: false, error: data.error || 'Login failed' });
            return false;
          }

          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'Network error' });
          return false;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
          });

          const data = await response.json();

          if (!response.ok) {
            set({ isLoading: false, error: data.error || 'Registration failed' });
            return false;
          }

          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'Network error' });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          return false;
        }

        try {
          const response = await fetch(`${API_URL}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          const data = await response.json();

          if (!response.ok) {
            get().logout();
            return false;
          }

          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });

          return true;
        } catch {
          get().logout();
          return false;
        }
      },

      fetchUser: async () => {
        const { accessToken } = get();
        
        if (!accessToken) {
          return;
        }

        try {
          const response = await fetch(`${API_URL}/me`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              // Try to refresh token
              const refreshed = await get().refreshAuth();
              if (refreshed) {
                await get().fetchUser();
              }
            }
            return;
          }

          const data = await response.json();
          set({ user: data.user, isAuthenticated: true });
        } catch {
          // Silent fail - user will need to re-login
        }
      },

      updatePreferences: async (preferences: User['preferences']) => {
        const { accessToken } = get();
        
        if (!accessToken) {
          return false;
        }

        try {
          const response = await fetch(`${API_URL}/preferences`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ preferences }),
          });

          const data = await response.json();

          if (!response.ok) {
            set({ error: data.error || 'Failed to update preferences' });
            return false;
          }

          set({ user: data.user });
          return true;
        } catch (error: any) {
          set({ error: error.message || 'Network error' });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hook for getting auth header
export const useAuthHeader = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};
