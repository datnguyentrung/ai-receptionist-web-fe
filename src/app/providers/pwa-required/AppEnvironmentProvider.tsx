/* eslint-disable react-refresh/only-export-components */
import {
  createCheckingAppEnvironment,
  detectAppEnvironment,
  PWA_DISPLAY_MODES,
  type AppEnvironmentResult,
} from "@/utils/appEnvironment";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type InstallState =
  | "unavailable"
  | "available"
  | "prompting"
  | "dismissed"
  | "accepted"
  | "installed"
  | "error";

type InstallPromptOutcome = "accepted" | "dismissed";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: InstallPromptOutcome }>;
}

type AppEnvironmentContextValue = {
  appEnvironment: AppEnvironmentResult;
  installState: InstallState;
  requestInstall: () => Promise<void>;
};

const AppEnvironmentContext = createContext<AppEnvironmentContextValue | null>(
  null,
);

const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function subscribeToMediaQuery(query: MediaQueryList, listener: () => void) {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }

  const legacyQuery = query as MediaQueryList & {
    addListener?: (callback: () => void) => void;
    removeListener?: (callback: () => void) => void;
  };
  legacyQuery.addListener?.(listener);
  return () => legacyQuery.removeListener?.(listener);
}

export function AppEnvironmentProvider({ children }: { children: ReactNode }) {
  const [appEnvironment, setAppEnvironment] =
    useState<AppEnvironmentResult>(createCheckingAppEnvironment);
  const [deferredInstallPrompt, setDeferredInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<InstallState>("unavailable");

  const syncEnvironment = useCallback(() => {
    setAppEnvironment(detectAppEnvironment());
  }, []);

  useBrowserLayoutEffect(() => {
    syncEnvironment();

    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setDeferredInstallPrompt(installEvent);
      setInstallState("available");
    };
    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
      setInstallState("installed");
      syncEnvironment();
    };
    const mediaQueries = PWA_DISPLAY_MODES.map((mode) =>
      window.matchMedia?.(`(display-mode: ${mode})`),
    ).filter((query): query is MediaQueryList => Boolean(query));

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    const unsubscribeMediaQueries = mediaQueries.map((query) =>
      subscribeToMediaQuery(query, syncEnvironment),
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      unsubscribeMediaQueries.forEach((unsubscribe) => unsubscribe());
    };
  }, [syncEnvironment]);

  const requestInstall = useCallback(async () => {
    if (!deferredInstallPrompt) {
      return;
    }

    setInstallState("prompting");
    try {
      await deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      setDeferredInstallPrompt(null);
      setInstallState(outcome);
    } catch {
      setDeferredInstallPrompt(null);
      setInstallState("error");
    }
  }, [deferredInstallPrompt]);

  const value = useMemo(
    () => ({ appEnvironment, installState, requestInstall }),
    [appEnvironment, installState, requestInstall],
  );

  return (
    <AppEnvironmentContext.Provider value={value}>
      {children}
    </AppEnvironmentContext.Provider>
  );
}

export function useAppEnvironment() {
  const context = useContext(AppEnvironmentContext);
  if (!context) {
    throw new Error("useAppEnvironment must be used within AppEnvironmentProvider");
  }

  return context;
}
