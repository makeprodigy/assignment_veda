import { create } from 'zustand';
import type { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  setUser: (user) => {
    set({ user });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {}
    set({ user: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/logout';
    }
  },

  initAuth: async () => {
    if (typeof window === 'undefined') return;

    set({ isLoading: true });
    try {
      const response = await authApi.getMe();
      set({ user: response.data.data, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
