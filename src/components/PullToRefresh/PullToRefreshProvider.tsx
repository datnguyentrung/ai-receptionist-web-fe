import {
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  PullToRefreshContext,
  type PullToRefreshHandler,
} from "./PullToRefreshContext";

type PullToRefreshProviderProps = {
  children: ReactNode;
};

export function PullToRefreshProvider({
  children,
}: PullToRefreshProviderProps) {
  const refreshHandlerRef = useRef<PullToRefreshHandler | null>(null);

  const registerRefreshHandler = useCallback((handler: PullToRefreshHandler) => {
    refreshHandlerRef.current = handler;

    return () => {
      if (refreshHandlerRef.current === handler) {
        refreshHandlerRef.current = null;
      }
    };
  }, []);

  const runRefresh = useCallback(async () => {
    const handler = refreshHandlerRef.current;

    if (!handler) {
      window.location.reload();
      return;
    }

    await handler();
  }, []);

  const value = useMemo(
    () => ({
      registerRefreshHandler,
      runRefresh,
    }),
    [registerRefreshHandler, runRefresh],
  );

  return (
    <PullToRefreshContext.Provider value={value}>
      {children}
    </PullToRefreshContext.Provider>
  );
}
