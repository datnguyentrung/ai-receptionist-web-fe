import { useLogout } from "@/features/auth/api/useAuthentication";
import { useNavItems } from "@/hooks/useNavItems";
import { Bell, Menu, Search, Settings } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSettingsMenu } from "../../config/constants/ListActionDropDown";
import { MiniActionPopover } from "../ui/mini-action-popover";
import { showComingSoonActionToast } from "../ui/mini-action-popover.toast";
import styles from "./Header.module.scss";

export default function Header({
  setSidebarOpen,
}: {
  setSidebarOpen: (open: boolean) => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const nav_items = useNavItems();
  const settingsItems = useSettingsMenu();
  const logoutMutation = useLogout();

  // Tìm title dựa trên URL hiện tại
  const pageTitle =
    nav_items.find((n) =>
      n.path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(n.path),
    )?.label ?? "Dashboard";

  const handleSettingsActionSelect = async (actionId: string) => {
    const selectedItem = settingsItems.find((item) => item.id === actionId);

    if (!selectedItem) {
      return;
    }

    if (selectedItem.id === "logout") {
      logoutMutation.mutate();
      return;
    }

    if (selectedItem.id === "profile" && selectedItem.navigateTo) {
      navigate(selectedItem.navigateTo);
      return;
    }

    showComingSoonActionToast(selectedItem.label, "Cài đặt");
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
          <Menu size={20} />
        </button>

        {/* Title & Date */}
        <div>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <p className={styles.pageSubtitle}>
            Thứ 4, ngày 04 tháng 03 năm 2026
          </p>
        </div>
      </div>

      <div className={styles.headerCenter}>
        {/* Search */}
        <div className={styles.searchBar}>
          <Search size={15} style={{ color: "#9CA3AF" }} />
          <input placeholder="Tìm kiếm..." className={styles.searchInput} />
        </div>
      </div>

      <div className={styles.headerRight}>
        {/* Notif */}
        <div className={styles.notifContainer}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className={styles.iconBtn}
          >
            <Bell size={17} style={{ color: "#374151" }} />
            <span className={styles.notifDot} />
          </button>
          {notifOpen && (
            <div className={styles.notifDropdown}>
              <p className={styles.notifTitle}>Thông báo</p>
              {[
                {
                  text: "Nguyễn Văn An vừa đăng ký lớp học",
                  time: "2 phút trước",
                  dot: "#E02020",
                },
                {
                  text: "Lớp TKD-CB-A đã đầy 80% chỗ",
                  time: "15 phút trước",
                  dot: "#F59E0B",
                },
                {
                  text: "HLV Vũ Quốc Bảo xin nghỉ phép",
                  time: "1 giờ trước",
                  dot: "#6B7280",
                },
              ].map((n, i) => (
                <div key={i} className={styles.notifItem}>
                  <div
                    className={styles.notifItemDot}
                    style={{ background: n.dot }}
                  />
                  <div>
                    <p style={{ fontSize: "12px", color: "#374151" }}>
                      {n.text}
                    </p>
                    <p style={{ fontSize: "11px", color: "#9CA3AF" }}>
                      {n.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings Dropdown */}
        <MiniActionPopover
          itemLabel="Cài đặt"
          title="Mở menu cài đặt"
          triggerClassName={styles.iconBtn}
          contentClassName={styles.settingsMenuContent}
          actions={settingsItems.map((setting) => ({
            id: setting.id,
            label: setting.label,
            icon: setting.lucideIcon,
            isDanger: setting.isDanger,
          }))}
          onActionSelect={handleSettingsActionSelect}
        >
          <Settings size={17} style={{ color: "#374151" }} />
        </MiniActionPopover>
      </div>
    </header>
  );
}
