import { authApi } from "@/features/auth/api/authApi";
import { userAPI } from "@/features/user";
import { notifyAuthSessionInvalid } from "@/features/auth/utils/authEvents";
import { removeLegacyAuthStorage } from "@/features/auth/utils/authStorage";
import { ensureFcmTokenSynced } from "@/integrations/firebase/fcm";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { useEffect, useRef } from "react";

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const didBootstrap = useRef(false);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAuthFromResponse = useAuthStore((state) => state.setAuthFromResponse);
  const initProfile = useAuthStore((state) => state.initProfile);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const finishInitializing = useAuthStore((state) => state.finishInitializing);

  useEffect(() => {
    if (!hasHydrated) return;
    if (didBootstrap.current) return;
    didBootstrap.current = true;

    let isMounted = true;

    const bootstrap = async () => {
      removeLegacyAuthStorage();

      const syncFcmAfterHydration = () => {
        window.setTimeout(() => {
          void ensureFcmTokenSynced().catch(() => {
            console.error("[FCM] token sync failed after auth bootstrap.");
          });
        }, 0);
      };

      try {
        const hydrateAuth = async (
          account: Awaited<ReturnType<typeof authApi.getAccount>>,
        ) => {
          if (!isMounted) return;

          setAuthFromResponse(account);
          syncFcmAfterHydration();

          if (account.requiresContextSelection) {
            return;
          }

          try {
            const profiles = await userAPI.getUserInfo(
              account.accessToken ?? accessToken ?? undefined,
            );
            if (isMounted) initProfile(profiles);
          } catch {
            // Profile hydration is best-effort; auth remains valid from /auth/account.
          }
        };

        if (accessToken) {
          const account = await authApi.getAccount();
          await hydrateAuth(account);
          return;
        }

        const refreshed = await authApi.refreshToken();
        await hydrateAuth(refreshed);
      } catch (error) {
        if (!isMounted) return;

        if (axios.isAxiosError(error) && !error.response) {
          finishInitializing();
          return;
        }

        clearAuth();
        notifyAuthSessionInvalid();
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [
    accessToken,
    clearAuth,
    finishInitializing,
    hasHydrated,
    initProfile,
    setAuthFromResponse,
  ]);

  return <>{children}</>;
}
