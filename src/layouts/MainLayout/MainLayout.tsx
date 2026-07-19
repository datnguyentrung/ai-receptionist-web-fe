import { PullToRefresh } from "@/app/providers/pull-to-refresh";
import { APP_MODE, isPWA } from "@/config/appMode";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router";
import BottomNavigationBar from "./components/BottomNavigationBar";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import styles from "./MainLayout.module.scss";

const FULLSCREEN_ROUTES = new Set(["/check-in"]);
const SCROLL_TO_TOP_EVENT = "app:main-scroll-to-top";
const SAVE_SCROLL_POSITION_EVENT = "app:main-save-scroll-position";
const MAX_SCROLL_RESTORE_ATTEMPTS = 45;

const getScrollKey = (pathname: string, search: string) => `${pathname}${search}`;
const scrollPositions = new Map<string, number>();

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLElement | null>(null);
  const { pathname, search } = useLocation();
  const previousScrollKeyRef = useRef(getScrollKey(pathname, search));
  const isRestoringScrollRef = useRef(false);
  const isFullscreenRoute = FULLSCREEN_ROUTES.has(pathname.replace(/\/$/, ""));

  const saveCurrentScrollPosition = useCallback(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    scrollPositions.set(previousScrollKeyRef.current, contentElement.scrollTop);
  }, []);

  const scrollContentToTop = useCallback(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && !isFullscreenRoute) {
      document.body.classList.add("overlay-open");
    } else {
      document.body.classList.remove("overlay-open");
    }
    return () => document.body.classList.remove("overlay-open");
  }, [isFullscreenRoute, sidebarOpen]);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const handleScroll = () => {
      if (isRestoringScrollRef.current) return;
      scrollPositions.set(previousScrollKeyRef.current, contentElement.scrollTop);
    };

    contentElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      handleScroll();
      contentElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    window.addEventListener(SCROLL_TO_TOP_EVENT, scrollContentToTop);
    window.addEventListener(SAVE_SCROLL_POSITION_EVENT, saveCurrentScrollPosition);
    return () => {
      window.removeEventListener(SCROLL_TO_TOP_EVENT, scrollContentToTop);
      window.removeEventListener(
        SAVE_SCROLL_POSITION_EVENT,
        saveCurrentScrollPosition,
      );
    };
  }, [saveCurrentScrollPosition, scrollContentToTop]);

  useLayoutEffect(() => {
    const nextScrollKey = getScrollKey(pathname, search);
    const previousScrollKey = previousScrollKeyRef.current;
    const contentElement = contentRef.current;

    if (!contentElement) {
      previousScrollKeyRef.current = nextScrollKey;
      return;
    }

    scrollPositions.set(previousScrollKey, contentElement.scrollTop);
    previousScrollKeyRef.current = nextScrollKey;

    const targetScrollTop = scrollPositions.get(nextScrollKey) ?? 0;
    let frameId = 0;
    let attempts = 0;
    isRestoringScrollRef.current = true;

    const restoreScroll = () => {
      const maxScrollTop =
        contentElement.scrollHeight - contentElement.clientHeight;
      const canReachTarget = maxScrollTop >= targetScrollTop;

      contentElement.scrollTop = targetScrollTop;
      attempts += 1;

      if (
        attempts < MAX_SCROLL_RESTORE_ATTEMPTS &&
        (!canReachTarget || Math.abs(contentElement.scrollTop - targetScrollTop) > 2)
      ) {
        frameId = window.requestAnimationFrame(restoreScroll);
        return;
      }

      isRestoringScrollRef.current = false;
    };

    frameId = window.requestAnimationFrame(restoreScroll);
    return () => {
      isRestoringScrollRef.current = false;
      window.cancelAnimationFrame(frameId);
    };
  }, [pathname, search]);

  return (
    <div
      className={`${styles.layout} ${
        isFullscreenRoute ? styles.layoutFullscreen : ""
      }`}
      data-app-mode={APP_MODE}
    >
      {/* ── Mobile overlay ── */}
      {sidebarOpen && !isFullscreenRoute && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      {!isFullscreenRoute && (
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}

      {/* ── Main content ── */}
      <div className={styles.main}>
        {/* Top header */}
        {!isFullscreenRoute && <Header setSidebarOpen={setSidebarOpen} />}

        {/* Page content */}
        <main
          ref={contentRef}
          className={`${styles.content} ${
            isFullscreenRoute ? styles.contentFullscreen : ""
          }`}
        >
          <PullToRefresh
            enabled={isPWA && !isFullscreenRoute}
            scrollContainerRef={contentRef}
          >
            <Outlet />
          </PullToRefresh>
        </main>

        {!isFullscreenRoute && (
          <BottomNavigationBar onBeforeNavigate={saveCurrentScrollPosition} />
        )}
      </div>
    </div>
  );
}
