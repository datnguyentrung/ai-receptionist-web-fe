import { BOTTOM_NAV_ITEMS } from "@/config/constants/path";
import {
  preloadBottomNavRoutes,
  preloadRoute,
  type RoutePreloadContext,
} from "@/app/router/routePreload";
import { useAuthStore } from "@/store/authStore";
import { useRoleStudent } from "@/utils/roleUtils";
import { useQueryClient } from "@tanstack/react-query";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { isPWA } from "@/config/appMode";
import styles from "./BottomNavigationBar.module.scss";

export default function BottomNavigationBar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const [pendingItem, setPendingItem] = useState<{
    id: string;
    to: string;
  } | null>(null);
  const { canViewCoach } = useRoleStudent();
  const activeProfile = useAuthStore((state) => state.activeProfile);
  const userId =
    activeProfile?.userInfo?.userCode ?? activeProfile?.userInfo?.idUser;
  const scheduleIds = useMemo(
    () =>
      activeProfile?.userInfo?.assignedClasses
        ?.map((c) => c?.classSchedule?.scheduleId)
        ?.filter((id): id is string => Boolean(id)) ?? [],
    [activeProfile],
  );
  const normalizedPathname = pathname.replace(/\/$/, "") || "/";
  const navItems = useMemo(
    () => (userId ? BOTTOM_NAV_ITEMS({ userId }).filter((item) => item.to) : []),
    [userId],
  );
  const preloadContext = useMemo<RoutePreloadContext>(
    () => ({
      queryClient,
      userId,
      scheduleIds,
      canViewCoach,
    }),
    [canViewCoach, queryClient, scheduleIds, userId],
  );

  useEffect(() => {
    if (!isPWA || !userId) return;

    const idleWindow = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (idleWindow.requestIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(
        () => preloadBottomNavRoutes(preloadContext),
        { timeout: 1600 },
      );
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(
      () => preloadBottomNavRoutes(preloadContext),
      650,
    );
    return () => window.clearTimeout(timeoutId);
  }, [preloadContext, userId]);

  const isItemActive = useCallback((to: string) => {
    const normalizedTo = to.replace(/\/$/, "") || "/";
    return normalizedTo === "/"
      ? normalizedPathname === "/"
      : normalizedPathname === normalizedTo ||
          normalizedPathname.startsWith(`${normalizedTo}/`);
  }, [normalizedPathname]);

  const warmRoute = useCallback(
    (to: string) => {
      preloadRoute(to, preloadContext);
    },
    [preloadContext],
  );

  const handleNavigate = useCallback((id: string, to: string) => {
    if (isItemActive(to)) {
      return;
    }

    warmRoute(to);
    setPendingItem({ id, to });
    startTransition(() => {
      navigate(to);
    });
    window.setTimeout(() => {
      setPendingItem((current) => (current?.id === id ? null : current));
    }, 1800);
  }, [isItemActive, navigate, warmRoute]);

  const pendingItemId =
    pendingItem && !isItemActive(pendingItem.to) ? pendingItem.id : null;

  if (!isPWA || !userId) {
    return null;
  }

  return (
    <nav className={styles.bottomNav} aria-label="Dieu huong nhanh">
      <span className={styles.pendingStatus} aria-live="polite">
        {pendingItemId
          ? `Dang mo ${navItems.find((item) => item.id === pendingItemId)?.label ?? "man hinh"}`
          : ""}
      </span>
      <div className={styles.navShell}>
        {navItems.map(({ id, label, icon: Icon, to }) => {
          const isCheckIn = id === "check-in";
          const isActive = isItemActive(to as string);
          const isPending = pendingItemId === id && !isActive;

          return (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              title={label}
              className={[
                styles.navItem,
                isCheckIn ? styles.checkInItem : "",
                isActive ? styles.navItemActive : "",
                isPending ? styles.navItemPending : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleNavigate(id ?? label, to as string)}
              onFocus={() => warmRoute(to as string)}
              onPointerEnter={() => warmRoute(to as string)}
              onPointerDown={() => warmRoute(to as string)}
              onTouchStart={() => warmRoute(to as string)}
            >
              <span className={styles.iconWrap} data-active={isActive}>
                <Icon
                  size={isCheckIn ? 25 : 20}
                  strokeWidth={isCheckIn ? 2.4 : 2.2}
                />
              </span>
              <span className={styles.navLabel}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
