import logoImage from "@/assets/taekwondo.jpg";
import { useNavItems } from "@/hooks/useNavItems";
import { useAuthStore } from "@/store/authStore";
import { Bot, LogOut, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import Avatar from "../Avatar";
import ConfirmModal from "../ConfirmModal";
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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLogoutPending, setIsLogoutPending] = useState(false);
  const logoutTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (logoutTimeoutRef.current !== null) {
        window.clearTimeout(logoutTimeoutRef.current);
      }
    };
  }, []);

  const openLogoutModal = useCallback(() => {
    setIsLogoutModalOpen(true);
  }, []);

  const cancelLogout = useCallback(() => {
    if (logoutTimeoutRef.current !== null) {
      window.clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }

    setIsLogoutPending(false);
    setIsLogoutModalOpen(false);
  }, []);

  const confirmLogout = useCallback(() => {
    if (isLogoutPending) {
      return;
    }

    setIsLogoutPending(true);

    // Small delay keeps feedback visible before auth state changes.
    logoutTimeoutRef.current = window.setTimeout(() => {
      setIsLogoutPending(false);
      setIsLogoutModalOpen(false);
      clearAuth();
      logoutTimeoutRef.current = null;
    }, 900);
  }, [clearAuth, isLogoutPending]);

  return (
    <>
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
            type="button"
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
            <button
              type="button"
              className={styles.logoutButton}
              onClick={openLogoutModal}
              aria-label="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <ConfirmModal
        open={isLogoutModalOpen}
        title="Bạn có chắc muốn đăng xuất?"
        description="Bạn sẽ kết thúc phiên đăng nhập hiện tại. Bạn có thể đăng nhập lại bất kỳ lúc nào."
        cancelText="Hủy"
        confirmText="Có, đăng xuất"
        loadingText="Đang đăng xuất..."
        isLoading={isLogoutPending}
        linkGoToAfterConfirm={"/login"}
        successToastMessage="Đăng xuất thành công"
        errorToastMessage="Đăng xuất thất bại. Vui lòng thử lại."
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </>
  );
}
