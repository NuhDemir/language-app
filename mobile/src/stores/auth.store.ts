// src/stores/auth.store.ts
// Zustand Auth Store with AsyncStorage persistence

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';

// ============================================================
// AUTH STATE INTERFACE
// ============================================================
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setHydrated: (state: boolean) => void;
}

// ============================================================
// ZUSTAND STORE
// ============================================================
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isHydrated: false,

      login: (token: string, user: User) => {
        set({
          token,
          user,
          isAuthenticated: true,
        });
        console.log('✅ [Auth] User logged in:', user.username);
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
        console.log('🚪 [Auth] User logged out');
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      setHydrated: (state: boolean) => {
        set({ isHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
        console.log('💧 [Auth] Hydration complete, isAuthenticated:', state?.isAuthenticated);
      },
    }
  )
);

export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useUser = () => useAuthStore((state) => state.user);
export const useToken = () => useAuthStore((state) => state.token);
export const useIsHydrated = () => useAuthStore((state) => state.isHydrated);
