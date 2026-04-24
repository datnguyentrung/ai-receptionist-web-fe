import { WeekdayCodeToLabel } from "@/config/constants";
import { useNavItems } from "@/hooks/useNavItems";
import { Bell, Menu, Search } from "lucide-react";
import { useState } from "react";
import { matchPath, useLocation } from "react-router-dom";
import styles from "./Header.module.scss";

export default function Header({
  setSidebarOpen,
}: {
  setSidebarOpen: (open: boolean) => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const nav_items = useNavItems();

  // Tìm title dựa trên URL hiện tại
  const pageTitle =
    nav_items.find((n) => {
      if (n.path === "/") {
        return location.pathname === "/";
      }

      // matchPath sẽ hiểu "/:userCode" có thể match với "/TQC" hoặc "/VQT_123"
      // end: false giúp nó match cả các path con như "/TQC/classes" nếu có
      return matchPath({ path: n.path, end: false }, location.pathname);
    })?.label ?? "Dashboard";

  const formatVietnameseDate = (date: Date = new Date()): string => {
    const weekday = WeekdayCodeToLabel[date.getDay() + 1];
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${weekday}, ngày ${day} tháng ${month} năm ${date.getFullYear()}`;
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
          <Menu size={20} />
        </button>

        {/* Title & Date */}
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <p className={styles.pageSubtitle}>{formatVietnameseDate()}</p>
        </div>
      </div>

      <div className={styles.headerRight}>
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
      </div>
    </header>
  );
}
