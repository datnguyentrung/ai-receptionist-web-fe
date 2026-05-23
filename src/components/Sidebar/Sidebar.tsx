import logoImage from "/taekwondo.jpg";
import { useSettingsMenu } from "@/config/constants/ListActionDropDown";
import { useNavItems } from "@/hooks/useNavItems";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { Bot, ListIndentDecrease, ListIndentIncrease, X } from "lucide-react";
import { useCallback, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import Avatar from "../Avatar";
import ConfirmModal from "../ConfirmModal";
import { MiniActionPopover } from "../ui/mini-action-popover";
import { showComingSoonActionToast } from "../ui/mini-action-popover.toast";
import styles from "./Sidebar.module.scss";
import SidebarSettings from "./SidebarSettings";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const { activeProfile, logout } = useAuthStore((state) => state);
  const nav_items = useNavItems();
  const settingsItems = useSettingsMenu();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLogoutPending, setIsLogoutPending] = useState(false);
  const queryClient = useQueryClient();
  const studentCode = activeProfile?.userInfo?.userCode;

  const handleSidebarToggle = useCallback(() => {
    // Nếu màn hình lớn, thao tác là thu hẹp/mở rộng
    if (window.innerWidth >= 768) {
      setIsCollapsed((prev) => !prev);
      return;
    }
    // Nếu màn hình nhỏ, thao tác là đóng sidebar
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  const openLogoutModal = useCallback(() => setIsLogoutModalOpen(true), []);
  const handleSettingsActionSelect = useCallback(
    (actionId: string) => {
      const selectedItem = settingsItems.find((item) => item.id === actionId);

      if (!selectedItem) {
        return;
      }

      if (selectedItem.id === "logout") {
        openLogoutModal();
        return;
      }

      if (selectedItem.navigateTo) {
        navigate(selectedItem.navigateTo);
        return;
      }

      showComingSoonActionToast(selectedItem.label, "Tài khoản");
    },
    [navigate, openLogoutModal, settingsItems],
  );

  const cancelLogout = useCallback(() => {
    setIsLogoutPending(false);
    setIsLogoutModalOpen(false);
  }, []);

  const confirmLogout = useCallback(async () => {
    if (isLogoutPending) return;
    setIsLogoutPending(true);
    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 900));
      logout();
      queryClient.clear();
      setIsLogoutModalOpen(false);
    } finally {
      setIsLogoutPending(false);
    }
  }, [isLogoutPending, logout, queryClient]);

  return (
    <>
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""} ${isCollapsed ? styles.collapsed : ""}`}
      >
        {/* Logo */}
        <div className={styles.sidebarLogo}>
          <div className={styles.logoGroup} onClick={() => navigate("/")} role="button" tabIndex={0} onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/");
            }
          }}>
            <div className={styles.logoIconWrapper}>
              <img src={logoImage} alt="Logo" className={styles.logoImg} />
            </div>
            <div className={styles.brandText}>
              <p className={styles.brandName}>Taekwondo</p>
              <p className={styles.brandSub}>VĂN QUÁN</p>
            </div>
          </div>

          <button
            className={styles.closeBtn}
            onClick={handleSidebarToggle}
            type="button"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {/* Render cả 2 và dùng CSS để quyết định cái nào hiện tùy kích thước màn hình */}
            <span className={styles.mobileCloseIcon}>
              <X size={18} />
            </span>
            <span className={styles.desktopToggleIcon}>
              {isCollapsed ? (
                <ListIndentIncrease size={18} />
              ) : (
                <ListIndentDecrease size={18} />
              )}
            </span>
          </button>
        </div>

        {/* AI Receptionist badge */}
        <div className={styles.aiBadge}>
          <Bot size={16} style={{ color: "#E02020", flexShrink: 0 }} />
          <span className={styles.aiBadgeLabel}>AI RECEPTIONIST</span>
          <span className={styles.aiDot} />
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          <p className={styles.navLabel}>MENU CHÍNH</p>
          {nav_items.map(({ path, label, icon: Icon, display = true }) => {
            if (!display) return null;

            return (
              <NavLink
                key={path}
                to={path}
                end={
                  path === "/" ||
                  (!!studentCode && path === `/${studentCode}/*`)
                }
                onClick={() => {
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                title={label}
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
                      className={styles.navLinkText}
                      style={{
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {label}
                    </span>
                    {isActive && <div className={styles.navActiveIndicator} />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Profile switcher (visible only when multi-profile and not collapsed) */}
        {!isCollapsed && <SidebarSettings />}

        {/* Bottom user card */}
        <div className={styles.sidebarBottom}>
          <MiniActionPopover
            itemLabel="Tài khoản"
            title="Mở menu tài khoản"
            triggerClassName={styles.userCardTrigger}
            contentClassName={styles.userMenuContent}
            side="top"
            align="start"
            sideOffset={10}
            actions={settingsItems.flatMap((setting) => {
              const action = {
                id: setting.id,
                label: setting.label,
                icon: setting.lucideIcon,
                isDanger: setting.isDanger,
              };

              if (setting.id === "logout") {
                return [{ id: "__separator__" as const }, action];
              }

              return [action];
            })}
            onActionSelect={handleSettingsActionSelect}
          >
            <div className={styles.userCard}>
              <Avatar
                fullName={activeProfile?.userProfile?.name || ""}
                fontSize="14px"
                fontWeight={500}
                width="32px"
                height="32px"
              />
              <div className={styles.userInfo}>
                <p className={styles.userName}>
                  {activeProfile?.userProfile?.name || "Khách"}
                </p>
                <p className={styles.userRole}>
                  {activeProfile?.userInfo?.idRole || "Guest"}
                </p>
              </div>
            </div>
          </MiniActionPopover>
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
