import { createContext, useContext } from "react";

export type PullToRefreshHandler = () => void | Promise<void>;

export type PullToRefreshContextValue = {
  registerRefreshHandler: (handler: PullToRefreshHandler) => () => void;
  runRefresh: () => Promise<void>;
};

export const PullToRefreshContext =
  createContext<PullToRefreshContextValue | null>(null);

export function usePullToRefreshContext() {
  const context = useContext(PullToRefreshContext);

  if (!context) {
    throw new Error(
      "usePullToRefreshContext must be used within PullToRefreshProvider",
    );
  }

  return context;
}
