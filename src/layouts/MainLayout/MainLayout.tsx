import Sidebar from "@/components/Sidebar/Sidebar";
import { PullToRefresh } from "@/components/PullToRefresh";
import { APP_MODE, isPWA } from "@/config/appMode";
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router";
import BottomNavigationBar from "../../components/BottomNavigationBar";
import Header from "../../components/Header/Header";
import styles from "./MainLayout.module.scss";

const FULLSCREEN_ROUTES = new Set(["/check-in"]);

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLElement | null>(null);
  const { pathname } = useLocation();
  const isFullscreenRoute = FULLSCREEN_ROUTES.has(pathname.replace(/\/$/, ""));

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && !isFullscreenRoute) {
      document.body.classList.add("overlay-open");
    } else {
      document.body.classList.remove("overlay-open");
    }
    return () => document.body.classList.remove("overlay-open");
  }, [isFullscreenRoute, sidebarOpen]);

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

        {!isFullscreenRoute && <BottomNavigationBar />}
      </div>
    </div>
  );
}
