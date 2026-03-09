import type { UserLogin, UserResponse } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  user: UserLogin | UserResponse | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: UserLogin) => void;
  setUserProfile: (userInfo: UserResponse) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,

      // 1. Dùng lúc Login xong
      setAuth: (token, userLogin) =>
        set({ accessToken: token, user: userLogin, isAuthenticated: true }),

      // 2. Dùng lúc gọi /users/me xong
      setUserProfile: (fullUserData) =>
        set((state) => ({
          // Giữ lại các data cũ (như role, userId) và gộp thêm data mới
          user: { ...state.user, ...fullUserData },
        })),

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
