import type { UserResponse } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const LAST_ACTIVE_PROFILE_ID = "LAST_ACTIVE_PROFILE_ID";

// ─── State & Actions ───────────────────────────────────────────────
interface AuthState {
  accessToken: string | null;
  profiles: UserResponse[];
  activeProfile: UserResponse | null;
  isAuthenticated: boolean;

  // Auth lifecycle
  login: (token: string, profiles: UserResponse[]) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;

  // Profile management
  initProfile: (profiles: UserResponse[]) => void;
  switchProfile: (profileId: string) => void;
  clearAuth: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────
const safeGetLastProfileId = (): string | null => {
  try {
    return localStorage.getItem(LAST_ACTIVE_PROFILE_ID);
  } catch {
    return null;
  }
};

const safeSetLastProfileId = (id: string) => {
  try {
    localStorage.setItem(LAST_ACTIVE_PROFILE_ID, id);
  } catch {
    /* storage full or unavailable — non-critical */
  }
};

const safeRemoveLastProfileId = () => {
  try {
    localStorage.removeItem(LAST_ACTIVE_PROFILE_ID);
  } catch {
    /* no-op */
  }
};

const resolveActiveProfile = (
  profiles: UserResponse[],
): UserResponse | null => {
  if (profiles.length === 0) return null;

  const lastId = safeGetLastProfileId();
  if (lastId) {
    const match = profiles.find(
      (p) => p.userInfo.idUser === lastId,
    );
    if (match) return match;
  }

  // Fallback: first profile
  return profiles[0];
};

const clearRoleDebugSessionFlags = () => {
  if (typeof window === "undefined") return;
  const debugKeys = Object.keys(sessionStorage).filter((key) =>
    key.startsWith("role-debug-logged:"),
  );
  debugKeys.forEach((key) => sessionStorage.removeItem(key));
};

// ─── Store ─────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get, api) => ({
      accessToken: null,
      profiles: [],
      activeProfile: null,
      isAuthenticated: false,

      login: (token, profiles) => {
        const activeProfile = resolveActiveProfile(profiles);
        if (activeProfile) {
          safeSetLastProfileId(activeProfile.userInfo.idUser);
        }
        set({
          accessToken: token,
          profiles,
          activeProfile,
          isAuthenticated: true,
        });
      },

      setAccessToken: (token) =>
        set({ accessToken: token, isAuthenticated: true }),

      logout: () => {
        clearRoleDebugSessionFlags();
        safeRemoveLastProfileId();
        set({
          accessToken: null,
          profiles: [],
          activeProfile: null,
          isAuthenticated: false,
        });
        api.persist.clearStorage();
      },

      initProfile: (profiles) => {
        const activeProfile = resolveActiveProfile(profiles);
        if (activeProfile) {
          safeSetLastProfileId(activeProfile.userInfo.idUser);
        }
        set({ profiles, activeProfile });
      },

      switchProfile: (profileId) => {
        const profiles = _get().profiles;
        const target = profiles.find(
          (p) => p.userInfo.idUser === profileId,
        );
        if (!target) return;

        safeSetLastProfileId(profileId);
        set({ activeProfile: target });
      },

      clearAuth: () => {
        clearRoleDebugSessionFlags();
        safeRemoveLastProfileId();
        set({
          accessToken: null,
          profiles: [],
          activeProfile: null,
          isAuthenticated: false,
        });
        api.persist.clearStorage();
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        profiles: state.profiles,
        activeProfile: state.activeProfile,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
