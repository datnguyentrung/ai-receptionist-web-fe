import { ArrowDown, RefreshCw } from "lucide-react";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import styles from "./PullToRefresh.module.scss";
import {
  usePullToRefresh,
  type PullToRefreshStatus,
} from "./usePullToRefresh";
import { usePullToRefreshContext } from "./PullToRefreshContext";

type PullToRefreshProps = {
  children: ReactNode;
  enabled: boolean;
  scrollContainerRef: RefObject<HTMLElement | null>;
};

const STATUS_LABEL: Record<PullToRefreshStatus, string> = {
  idle: "Kéo xuống để làm mới",
  pulling: "Kéo xuống để làm mới",
  ready: "Thả để làm mới",
  refreshing: "Đang làm mới",
  success: "Đã cập nhật",
  error: "Không thể làm mới",
};

export function PullToRefresh({
  children,
  enabled,
  scrollContainerRef,
}: PullToRefreshProps) {
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const { runRefresh } = usePullToRefreshContext();
  const [status, setStatus] = useState<PullToRefreshStatus>("idle");

  const handleRefresh = useCallback(() => runRefresh(), [runRefresh]);

  usePullToRefresh({
    enabled,
    scrollContainerRef,
    indicatorRef,
    onRefresh: handleRefresh,
    onStatusChange: setStatus,
  });

  const isVisible = enabled && status !== "idle";
  const isRefreshing = status === "refreshing";
  const icon = useMemo(() => {
    if (status === "ready") {
      return <ArrowDown size={18} strokeWidth={2.35} aria-hidden="true" />;
    }

    return <RefreshCw size={18} strokeWidth={2.25} aria-hidden="true" />;
  }, [status]);

  return (
    <>
      {enabled ? (
        <div
          ref={indicatorRef}
          className={`${styles.indicator} ${isVisible ? styles.indicatorVisible : ""} ${
            isRefreshing ? styles.indicatorRefreshing : ""
          } ${status === "ready" ? styles.indicatorReady : ""}`}
          data-status={status}
          role="status"
          aria-live="polite"
          aria-hidden={!isVisible}
        >
          <div className={styles.surface}>
            <span className={styles.icon}>{icon}</span>
            <span className={styles.label}>{STATUS_LABEL[status]}</span>
          </div>
        </div>
      ) : null}
      {children}
    </>
  );
}
