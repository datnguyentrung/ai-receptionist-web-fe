import type {
  AuthContextType,
  AuthResponse,
  AuthStatus,
  AuthUser,
  SystemRole,
  UserContext,
  UserResponse,
} from "@/types";
import { clearAuthCompatibilityStorage } from "@/features/auth/utils/authStorage";
import { writeDebugStorage } from "@/utils/debugStorage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const LAST_ACTIVE_PROFILE_ID = "LAST_ACTIVE_PROFILE_ID";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  activeContext: UserContext | null;
  availableContexts: UserContext[];
  requiresContextSelection: boolean;
  authStatus: AuthStatus;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  // Legacy profile bridge. Keep domain/profile data out of AuthUser.
  profiles: UserResponse[];
  activeProfile: UserResponse | null;

  setAuthFromResponse: (response: AuthResponse) => void;
  setAccessToken: (token: string | null) => void;
  setActiveContext: (context: UserContext | null) => void;
  setAvailableContexts: (contexts: UserContext[]) => void;
  clearAuth: () => void;
  finishInitializing: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;

  login: (token: string, profiles: UserResponse[]) => void;
  logout: () => void;
  initProfile: (profiles: UserResponse[]) => void;
  switchProfile: (profileId: string) => void;

  getCurrentUserId: () => string | null;
  getCurrentPersonId: () => string | null;
  getCurrentContextType: () => AuthContextType | null;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: readonly string[]) => boolean;
  hasContextType: (type: AuthContextType) => boolean;
}

const getAuthStatus = (
  accessToken: string | null,
  user: AuthUser | null,
  activeContext: UserContext | null,
  requiresContextSelection: boolean,
): AuthStatus => {
  if (!accessToken || !user) return "anonymous";
  if (requiresContextSelection || !activeContext) return "selecting-context";
  return "authenticated";
};

const normalizeRole = (role: string) =>
  role.startsWith("ROLE_") ? role : `ROLE_${role}`;

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
    /* storage full or unavailable */
  }
};

const safeRemoveLastProfileId = () => {
  try {
    localStorage.removeItem(LAST_ACTIVE_PROFILE_ID);
  } catch {
    /* no-op */
  }
};

const resolveActiveProfile = (profiles: UserResponse[]): UserResponse | null => {
  if (profiles.length === 0) return null;

  const lastId = safeGetLastProfileId();
  if (lastId) {
    const match = profiles.find((p) => p.userInfo.idUser === lastId);
    if (match) return match;
  }

  return profiles[0];
};

const clearRoleDebugSessionFlags = () => {
  if (typeof window === "undefined") return;

  const debugKeys = Object.keys(sessionStorage).filter((key) =>
    key.startsWith("role-debug-logged:"),
  );
  debugKeys.forEach((key) => sessionStorage.removeItem(key));
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get, api) => ({
      accessToken: null,
      user: null,
      activeContext: null,
      availableContexts: [],
      requiresContextSelection: false,
      authStatus: "initializing",
      isAuthenticated: false,
      hasHydrated: false,
      profiles: [],
      activeProfile: null,

      setAuthFromResponse: (response) => {
        const token = response.accessToken ?? get().accessToken;
        const status = getAuthStatus(
          token,
          response.user,
          response.activeContext,
          response.requiresContextSelection,
        );

        set({
          accessToken: token,
          user: response.user,
          activeContext: response.activeContext,
          availableContexts: response.availableContexts ?? [],
          requiresContextSelection: response.requiresContextSelection,
          authStatus: status,
          isAuthenticated: status !== "anonymous",
          hasHydrated: true,
        });
      },

      setAccessToken: (token) => {
        const { user, activeContext, requiresContextSelection } = get();
        const status = getAuthStatus(
          token,
          user,
          activeContext,
          requiresContextSelection,
        );

        set({
          accessToken: token,
          authStatus: status,
          isAuthenticated: status !== "anonymous",
        });
      },

      setActiveContext: (context) => {
        const { accessToken, user } = get();
        const requiresContextSelection = !context;
        const status = getAuthStatus(
          accessToken,
          user,
          context,
          requiresContextSelection,
        );

        set({
          activeContext: context,
          requiresContextSelection,
          authStatus: status,
          isAuthenticated: status !== "anonymous",
        });
      },

      setAvailableContexts: (contexts) => set({ availableContexts: contexts }),

      finishInitializing: () => {
        const { accessToken, user, activeContext, requiresContextSelection } =
          get();
        const status = getAuthStatus(
          accessToken,
          user,
          activeContext,
          requiresContextSelection,
        );
        set({
          authStatus: status,
          isAuthenticated: status !== "anonymous",
          hasHydrated: true,
        });
      },

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      clearAuth: () => {
        writeDebugStorage("auth_logout_debug", {
          source: "authStore.clearAuth",
        });
        clearRoleDebugSessionFlags();
        safeRemoveLastProfileId();
        clearAuthCompatibilityStorage();
        set({
          accessToken: null,
          user: null,
          activeContext: null,
          availableContexts: [],
          requiresContextSelection: false,
          authStatus: "anonymous",
          isAuthenticated: false,
          hasHydrated: true,
          profiles: [],
          activeProfile: null,
        });
        api.persist.clearStorage();
      },

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

      logout: () => get().clearAuth(),

      initProfile: (profiles) => {
        const activeProfile = resolveActiveProfile(profiles);
        if (activeProfile) {
          safeSetLastProfileId(activeProfile.userInfo.idUser);
        }
        set({ profiles, activeProfile });
      },

      switchProfile: (profileId) => {
        const target = get().profiles.find(
          (p) => p.userInfo.idUser === profileId,
        );
        if (!target) return;

        safeSetLastProfileId(profileId);
        set({ activeProfile: target });
      },

      getCurrentUserId: () => get().user?.userId ?? null,
      getCurrentPersonId: () => get().activeContext?.personId ?? null,
      getCurrentContextType: () => get().activeContext?.contextType ?? null,
      hasRole: (role) => {
        const requiredRole = normalizeRole(role);
        return Boolean(
          get().user?.roles.some(
            (currentRole) => normalizeRole(currentRole) === requiredRole,
          ),
        );
      },
      hasAnyRole: (roles) => roles.some((role) => get().hasRole(role)),
      hasContextType: (type) => get().activeContext?.contextType === type,
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        activeContext: state.activeContext,
        availableContexts: state.availableContexts,
        requiresContextSelection: state.requiresContextSelection,
        profiles: state.profiles,
        activeProfile: state.activeProfile,
      }),
      onRehydrateStorage: () => (state) => {
        state?.finishInitializing();
      },
    },
  ),
);

export const getAuthAccessToken = () => useAuthStore.getState().accessToken;
export const hasAuthRole = (role: SystemRole) =>
  useAuthStore.getState().hasRole(role);
