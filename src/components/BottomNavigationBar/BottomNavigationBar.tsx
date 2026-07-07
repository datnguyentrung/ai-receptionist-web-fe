import { BOTTOM_NAV_ITEMS } from "@/config/constants/path";
import { useAuthStore } from "@/store/authStore";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { isPWA } from "../../config/appMode";
import styles from "./BottomNavigationBar.module.scss";

export default function BottomNavigationBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const activeProfile = useAuthStore((state) => state.activeProfile);
  const userId =
    activeProfile?.userInfo?.userCode ?? activeProfile?.userInfo?.idUser;
  const normalizedPathname = pathname.replace(/\/$/, "") || "/";
  const navItems = useMemo(
    () => (userId ? BOTTOM_NAV_ITEMS({ userId }).filter((item) => item.to) : []),
    [userId],
  );

  if (!isPWA || !userId) {
    return null;
  }

  const isItemActive = (to: string) => {
    const normalizedTo = to.replace(/\/$/, "") || "/";
    return normalizedTo === "/"
      ? normalizedPathname === "/"
      : normalizedPathname === normalizedTo ||
          normalizedPathname.startsWith(`${normalizedTo}/`);
  };

  const handleNavigate = (id: string, to: string) => {
    if (isItemActive(to)) {
      return;
    }

    setPendingItemId(id);
    window.requestAnimationFrame(() => {
      navigate(to);
    });
    window.setTimeout(() => {
      setPendingItemId((currentId) => (currentId === id ? null : currentId));
    }, 1200);
  };

  return (
    <nav className={styles.bottomNav} aria-label="Dieu huong nhanh">
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
