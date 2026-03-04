import logoImage from "@assets/taekwondo.jpg";
import {
  Bell,
  Bot,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import styles from "./Layout.module.scss";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/coaches", label: "Quản lý HLV", icon: UserCheck },
  { path: "/students", label: "Quản lý Học Viên", icon: Users },
  { path: "/schedules", label: "Lịch Học", icon: CalendarDays },
  { path: "/attendance", label: "Điểm Danh", icon: ClipboardList },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();

  const pageTitle =
    NAV_ITEMS.find((n) =>
      n.path === "/dashboard"
        ? location.pathname === "/dashboard"
        : location.pathname.startsWith(n.path),
    )?.label ?? "Dashboard";

  return (
    <div className={styles.layout}>
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
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
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/dashboard"}
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
            <div className={styles.userAvatar}>AD</div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>Admin Hệ Thống</p>
              <p className={styles.userRole}>Quản trị viên</p>
            </div>
            <LogOut
              size={14}
              style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }}
            />
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className={styles.main}>
        {/* Top header */}
        <header className={styles.header}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen(true)}
          >
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

          <button className={styles.iconBtn}>
            <Settings size={17} style={{ color: "#374151" }} />
          </button>
        </header>

        {/* Page content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
