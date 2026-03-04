import type { UserLogin } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  user: UserLogin | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: UserLogin) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) =>
        set({ accessToken: token, user, isAuthenticated: true }),
      clearAuth: () =>
        set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
