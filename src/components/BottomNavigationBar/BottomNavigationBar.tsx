import { BOTTOM_NAV_ITEMS } from "@/config/constants/path";
import { useAuthStore } from "@/store/authStore";
import { NavLink } from "react-router";
import styles from "./BottomNavigationBar.module.scss";
import { isPWA } from '../../config/appMode';

export default function BottomNavigationBar() {
  const activeProfile = useAuthStore((state) => state.activeProfile);
  const userId =
    activeProfile?.userInfo?.userCode ?? activeProfile?.userInfo?.idUser;

  if (!isPWA || !userId) {
    return null;
  }

  const items = BOTTOM_NAV_ITEMS({ userId });

  return (
    <nav className={styles.bottomNav} aria-label="Dieu huong nhanh">
      <div className={styles.navShell}>
        {items.map(({ id, label, icon: Icon, linkTo }) => {
          const isCheckIn = id === "check-in";

          return (
            <NavLink
              key={id}
              to={linkTo}
              end={linkTo === "/"}
              aria-label={label}
              title={label}
              className={({ isActive }) =>
                [
                  styles.navItem,
                  isCheckIn ? styles.checkInItem : "",
                  isActive ? styles.navItemActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <span className={styles.iconWrap} data-active={isActive}>
                    <Icon
                      size={isCheckIn ? 25 : 20}
                      strokeWidth={isCheckIn ? 2.4 : 2.2}
                    />
                  </span>
                  <span className={styles.navLabel}>{label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
