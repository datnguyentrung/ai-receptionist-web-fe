import { useEffect, useRef, type RefObject } from "react";

export type PullToRefreshStatus =
  | "idle"
  | "pulling"
  | "ready"
  | "refreshing"
  | "success"
  | "error";

type UsePullToRefreshOptions = {
  enabled: boolean;
  scrollContainerRef: RefObject<HTMLElement | null>;
  indicatorRef: RefObject<HTMLElement | null>;
  onRefresh: () => Promise<void>;
  onStatusChange: (status: PullToRefreshStatus) => void;
};

const MAX_PULL_DISTANCE = 120;
const REFRESH_THRESHOLD = 80;
const RESISTANCE = 0.45;
const RESET_DELAY_MS = 520;
const INTERACTIVE_SELECTOR = [
  "input",
  "textarea",
  "select",
  "button",
  "a[href]",
  "canvas",
  "video",
  "[contenteditable='true']",
  "[role='button']",
  "[role='dialog']",
  "[aria-modal='true']",
  "[data-slot='carousel']",
  "[data-slot='carousel-content']",
  "[data-slot='slider']",
  "[data-radix-scroll-area-viewport]",
  "[data-pull-to-refresh-ignore]",
  "[data-modal-drag-handle='true']",
].join(",");

function isScrollableElement(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  const canScrollY =
    /(auto|scroll|overlay)/.test(style.overflowY) &&
    element.scrollHeight > element.clientHeight + 1;
  const canScrollX =
    /(auto|scroll|overlay)/.test(style.overflowX) &&
    element.scrollWidth > element.clientWidth + 1;

  return canScrollY || canScrollX;
}

function hasNestedScrollableTarget(
  target: EventTarget | null,
  scrollContainer: HTMLElement,
) {
  if (!(target instanceof HTMLElement)) {
    return true;
  }

  if (target.closest(INTERACTIVE_SELECTOR)) {
    return true;
  }

  let current: HTMLElement | null = target;

  while (current && current !== scrollContainer) {
    if (isScrollableElement(current)) {
      return true;
    }

    current = current.parentElement;
  }

  return false;
}

export function usePullToRefresh({
  enabled,
  scrollContainerRef,
  indicatorRef,
  onRefresh,
  onStatusChange,
}: UsePullToRefreshOptions) {
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const pullDistanceRef = useRef(0);
  const isTrackingRef = useRef(false);
  const isPullGestureRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const hasTriggeredRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const indicator = indicatorRef.current;

    if (!indicator) {
      return;
    }

    const setPullDistance = (distance: number) => {
      pullDistanceRef.current = distance;

      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        indicator.style.setProperty(
          "--pull-to-refresh-distance",
          `${pullDistanceRef.current}px`,
        );
      });
    };

    const clearResetTimer = () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    };

    const resetGesture = () => {
      isTrackingRef.current = false;
      isPullGestureRef.current = false;
      hasTriggeredRef.current = false;
      setPullDistance(0);
    };

    if (!enabled) {
      onStatusChange("idle");
      resetGesture();
      return () => {
        clearResetTimer();
      };
    }

    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) {
      return () => {
        clearResetTimer();
      };
    }

    const handleTouchStart = (event: TouchEvent) => {
      if (
        event.touches.length !== 1 ||
        isRefreshingRef.current ||
        scrollContainer.scrollTop > 0 ||
        hasNestedScrollableTarget(event.target, scrollContainer)
      ) {
        isTrackingRef.current = false;
        return;
      }

      clearResetTimer();
      startXRef.current = event.touches[0]?.clientX ?? 0;
      startYRef.current = event.touches[0]?.clientY ?? 0;
      isTrackingRef.current = true;
      isPullGestureRef.current = false;
      hasTriggeredRef.current = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isTrackingRef.current || event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      const deltaX = touch.clientX - startXRef.current;
      const deltaY = touch.clientY - startYRef.current;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (!isPullGestureRef.current) {
        if (absDeltaX >= absDeltaY || deltaY <= 0 || scrollContainer.scrollTop > 0) {
          isTrackingRef.current = false;
          return;
        }

        if (absDeltaY < 6) {
          return;
        }

        isPullGestureRef.current = true;
        onStatusChange("pulling");
      }

      if (event.cancelable) {
        event.preventDefault();
      }

      const nextDistance = Math.min(MAX_PULL_DISTANCE, deltaY * RESISTANCE);
      setPullDistance(nextDistance);
      onStatusChange(nextDistance >= REFRESH_THRESHOLD ? "ready" : "pulling");
    };

    const handleTouchEnd = () => {
      if (!isTrackingRef.current || !isPullGestureRef.current) {
        resetGesture();
        onStatusChange("idle");
        return;
      }

      const shouldRefresh =
        pullDistanceRef.current >= REFRESH_THRESHOLD &&
        !isRefreshingRef.current &&
        !hasTriggeredRef.current;

      if (!shouldRefresh) {
        resetGesture();
        onStatusChange("idle");
        return;
      }

      hasTriggeredRef.current = true;
      isRefreshingRef.current = true;
      setPullDistance(REFRESH_THRESHOLD);
      onStatusChange("refreshing");

      void onRefresh()
        .then(() => {
          onStatusChange("success");
        })
        .catch(() => {
          onStatusChange("error");
        })
        .finally(() => {
          isRefreshingRef.current = false;
          resetTimerRef.current = window.setTimeout(() => {
            resetGesture();
            onStatusChange("idle");
          }, RESET_DELAY_MS);
        });
    };

    scrollContainer.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    scrollContainer.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    scrollContainer.addEventListener("touchend", handleTouchEnd);
    scrollContainer.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      scrollContainer.removeEventListener("touchstart", handleTouchStart);
      scrollContainer.removeEventListener("touchmove", handleTouchMove);
      scrollContainer.removeEventListener("touchend", handleTouchEnd);
      scrollContainer.removeEventListener("touchcancel", handleTouchEnd);
      clearResetTimer();

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [
    enabled,
    indicatorRef,
    onRefresh,
    onStatusChange,
    scrollContainerRef,
  ]);
}
