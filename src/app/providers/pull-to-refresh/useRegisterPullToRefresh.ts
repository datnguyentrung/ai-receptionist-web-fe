import { useEffect } from "react";
import {
  usePullToRefreshContext,
  type PullToRefreshHandler,
} from "./PullToRefreshContext";

export function useRegisterPullToRefresh(
  handler: PullToRefreshHandler | null | undefined,
) {
  const { registerRefreshHandler } = usePullToRefreshContext();

  useEffect(() => {
    if (!handler) {
      return;
    }

    return registerRefreshHandler(handler);
  }, [handler, registerRefreshHandler]);
}
