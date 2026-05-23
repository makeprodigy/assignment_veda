import { create } from 'zustand';
import type { User } from '@/types';
import { authApi, saveToken, clearToken } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User, token?: string) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  setUser: (user, token) => {
    if (token) saveToken(token);
    set({ user });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {}
    clearToken();
    set({ user: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  initAuth: async () => {
    if (typeof window === 'undefined') return;

    set({ isLoading: true });
    try {
      const response = await authApi.getMe();
      set({ user: response.data.data, isLoading: false });
    } catch {
      clearToken();
      set({ user: null, isLoading: false });
    }
  },
}));
