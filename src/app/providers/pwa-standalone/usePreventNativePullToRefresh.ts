import { useEffect } from "react";
import { isPwaStandalone } from "@/utils/isPwaStandalone";

const DIRECTION_LOCK_DISTANCE = 8;

function canScrollVertically(element: HTMLElement) {
  const { overflowY } = window.getComputedStyle(element);
  return /(auto|scroll|overlay)/.test(overflowY) &&
    element.scrollHeight > element.clientHeight + 1;
}

function getScrollableAncestor(target: EventTarget | null) {
  let element = target instanceof Element ? target : null;

  while (element && element !== document.documentElement) {
    if (element instanceof HTMLElement && canScrollVertically(element)) {
      return element;
    }

    element = element.parentElement;
  }

  return null;
}

function isDocumentAtTop() {
  return (
    window.scrollY <= 0 &&
    document.documentElement.scrollTop <= 0 &&
    document.body.scrollTop <= 0
  );
}

/**
 * Adds an iOS fallback for browsers that ignore overscroll-behavior. It only
 * cancels a single-finger, vertically downward gesture once its active scroll
 * container is already at its top edge.
 */
export function usePreventNativePullToRefresh() {
  useEffect(() => {
    if (!isPwaStandalone()) {
      return;
    }

    const root = document.documentElement;
    const body = document.body;
    const mediaQueries = [
      window.matchMedia?.("(display-mode: standalone)"),
      window.matchMedia?.("(display-mode: fullscreen)"),
    ].filter((query): query is MediaQueryList => Boolean(query));

    const syncStandaloneAttribute = () => {
      const isStandalone = isPwaStandalone();
      root.toggleAttribute("data-pwa-standalone", isStandalone);
      body.toggleAttribute("data-pwa-standalone", isStandalone);
      document.getElementById("root")?.toggleAttribute("data-pwa-standalone", isStandalone);
    };

    let startX = 0;
    let startY = 0;
    let startedAtTop = false;
    let isVerticalPull: boolean | null = null;

    const resetGesture = () => {
      startedAtTop = false;
      isVerticalPull = null;
    };

    const handleTouchStart = (event: TouchEvent) => {
      resetGesture();

      if (event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      if (!touch) return;

      const scrollContainer = getScrollableAncestor(event.target);
      startedAtTop = scrollContainer
        ? scrollContainer.scrollTop <= 0
        : isDocumentAtTop();
      startX = touch.clientX;
      startY = touch.clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!startedAtTop || event.touches.length !== 1 || !event.cancelable) {
        return;
      }

      const touch = event.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      if (isVerticalPull === null) {
        if (
          Math.max(Math.abs(deltaX), Math.abs(deltaY)) < DIRECTION_LOCK_DISTANCE
        ) {
          return;
        }

        isVerticalPull = deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX);
      }

      if (isVerticalPull) {
        event.preventDefault();
      }
    };

    syncStandaloneAttribute();
    document.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
    document.addEventListener("touchend", resetGesture, { passive: true, capture: true });
    document.addEventListener("touchcancel", resetGesture, { passive: true, capture: true });
    mediaQueries.forEach((query) => query.addEventListener("change", syncStandaloneAttribute));

    return () => {
      document.removeEventListener("touchstart", handleTouchStart, true);
      document.removeEventListener("touchmove", handleTouchMove, true);
      document.removeEventListener("touchend", resetGesture, true);
      document.removeEventListener("touchcancel", resetGesture, true);
      mediaQueries.forEach((query) => query.removeEventListener("change", syncStandaloneAttribute));
      root.removeAttribute("data-pwa-standalone");
      body.removeAttribute("data-pwa-standalone");
      document.getElementById("root")?.removeAttribute("data-pwa-standalone");
    };
  }, []);
}
