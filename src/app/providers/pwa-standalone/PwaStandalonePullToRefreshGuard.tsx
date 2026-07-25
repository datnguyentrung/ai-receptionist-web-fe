import { usePreventNativePullToRefresh } from "./usePreventNativePullToRefresh";

export function PwaStandalonePullToRefreshGuard() {
  usePreventNativePullToRefresh();
  return null;
}
