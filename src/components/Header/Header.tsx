import { NAV_ITEMS } from "@/config/constants/path";
import { Bell, Menu, Search, Settings } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router";
import styles from "./Header.module.scss";

export default function Header({
  setSidebarOpen,
}: {
  setSidebarOpen: (open: boolean) => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();

  // Tìm title dựa trên URL hiện tại
  const pageTitle =
    NAV_ITEMS.find((n) =>
      n.path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(n.path),
    )?.label ?? "Dashboard";

  return (
    <header className={styles.header}>
      <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
        <Menu size={20} />
      </button>

      <div>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
        <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
          Thứ 4, ngày 04 tháng 03 năm 2026
        </p>
      </div>

      {/* Search */}
      <div className={styles.searchBar}>
        <Search size={15} style={{ color: "#9CA3AF" }} />
        <input placeholder="Tìm kiếm..." className={styles.searchInput} />
      </div>

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
                  <p style={{ fontSize: "12px", color: "#374151" }}>{n.text}</p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className={styles.iconBtn}>
        <Settings size={17} style={{ color: "#374151" }} />
      </button>
    </header>
  );
}
