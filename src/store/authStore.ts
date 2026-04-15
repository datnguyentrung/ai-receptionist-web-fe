import type { UserResponse } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: UserResponse) => void;
  setUserProfile: (userInfo: UserResponse) => void;
  clearAuth: () => void;
}

const clearRoleDebugSessionFlags = () => {
  if (typeof window === "undefined") {
    return;
  }

  const debugKeys = Object.keys(sessionStorage).filter((key) =>
    key.startsWith("role-debug-logged:"),
  );

  debugKeys.forEach((key) => sessionStorage.removeItem(key));
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,

      // 1. Dùng lúc Login xong
      setAuth: (token, user) =>
        set({ accessToken: token, user, isAuthenticated: true }),

      // 2. Dùng lúc gọi /users/me xong
      setUserProfile: (fullUserData) => set({ user: fullUserData }),

      clearAuth: () => {
        clearRoleDebugSessionFlags();
        set({ accessToken: null, user: null, isAuthenticated: false });
      },
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
