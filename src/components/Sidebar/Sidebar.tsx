import logoImage from "@/assets/taekwondo.jpg";
import { useNavItems } from "@/hooks/useNavItems";
import { useAuthStore } from "@/store/authStore";
import { Bot, LogOut, X } from "lucide-react";
import { NavLink } from "react-router";
import Avatar from "../Avatar";
import styles from "./Sidebar.module.scss";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const { user, clearAuth } = useAuthStore((state) => state);
  const nav_items = useNavItems();
  return (
    <aside
      className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
    >
      {/* Logo */}
      <div className={styles.sidebarLogo}>
        <div className={styles.logoIconWrapper}>
          <img src={logoImage} alt="Logo" className={styles.logoImg} />
        </div>
        <div>
          <p className={styles.brandName}>Taekwondo</p>
          <p className={styles.brandSub}>VĂN QUÁN</p>
        </div>
        <button
          className={styles.closeBtn}
          onClick={() => setSidebarOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      {/* AI Receptionist badge */}
      <div className={styles.aiBadge}>
        <Bot size={16} style={{ color: "#E02020" }} />
        <span className={styles.aiBadgeLabel}>AI RECEPTIONIST</span>
        <span className={styles.aiDot} />
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        <p className={styles.navLabel}>MENU CHÍNH</p>
        {nav_items.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  style={{
                    flexShrink: 0,
                    color: isActive ? "white" : "rgba(255,255,255,0.5)",
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {label}
                </span>
                {isActive && <div className={styles.navActiveIndicator} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom user card */}
      <div className={styles.sidebarBottom}>
        <div className={styles.userCard}>
          <Avatar
            fullName={user?.userProfile?.name || ""}
            fontSize="14px"
            fontWeight={500}
            width="32px"
            height="32px"
          />
          <div className={styles.userInfo}>
            <p className={styles.userName}>
              {user?.userProfile?.name || "Khách"}
            </p>
            <p className={styles.userRole}>
              {user?.userInfo?.idRole || "Guest"}
            </p>
          </div>
          <LogOut
            size={14}
            style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }}
            onClick={clearAuth}
          />
        </div>
      </div>
    </aside>
  );
}
