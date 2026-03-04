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

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
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
      n.path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(n.path),
    )?.label ?? "Dashboard";

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        fontFamily: "'Inter', 'Poppins', sans-serif",
        background: "#F4F6FA",
      }}
    >
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: "260px", background: "#1A1A2E", flexShrink: 0 }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-5 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: "white" }}
          >
            <img
              src={logoImage}
              alt="Logo"
              className="w-9 h-9 object-contain"
            />
          </div>
          <div>
            <p
              className="text-white"
              style={{ fontSize: "13px", fontWeight: 700, lineHeight: 1.2 }}
            >
              Taekwondo
            </p>
            <p
              style={{
                fontSize: "10px",
                color: "#E02020",
                fontWeight: 600,
                letterSpacing: "1px",
              }}
            >
              VĂN QUÁN
            </p>
          </div>
          <button
            className="ml-auto text-white/40 hover:text-white md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* AI Receptionist badge */}
        <div
          className="mx-4 mt-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: "rgba(224,32,32,0.15)",
            border: "1px solid rgba(224,32,32,0.3)",
          }}
        >
          <Bot size={16} style={{ color: "#E02020" }} />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#E02020",
              letterSpacing: "0.5px",
            }}
          >
            AI RECEPTIONIST
          </span>
          <span
            className="ml-auto w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#22C55E" }}
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          <p
            className="px-3 mb-2"
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "1.5px",
            }}
          >
            MENU CHÍNH
          </p>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all group ${isActive ? "text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"}`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: "#E02020",
                      boxShadow: "0 4px 14px rgba(224,32,32,0.4)",
                    }
                  : {}
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    style={{
                      flexShrink: 0,
                      color: isActive ? "white" : undefined,
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
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom user card */}
        <div
          className="p-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/5 transition">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "#E02020" }}
            >
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-white truncate"
                style={{ fontSize: "12px", fontWeight: 600 }}
              >
                Admin Hệ Thống
              </p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
                Quản trị viên
              </p>
            </div>
            <LogOut
              size={14}
              style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }}
            />
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header
          className="flex items-center gap-4 px-6 py-4 bg-white border-b"
          style={{ borderColor: "#E8EBF0", flexShrink: 0 }}
        >
          <button
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div>
            <h1
              className="text-gray-800"
              style={{ fontSize: "18px", fontWeight: 700 }}
            >
              {pageTitle}
            </h1>
            <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
              Thứ 4, ngày 04 tháng 03 năm 2026
            </p>
          </div>

          {/* Search */}
          <div
            className="ml-auto hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border"
            style={{
              borderColor: "#E8EBF0",
              background: "#F4F6FA",
              width: "240px",
            }}
          >
            <Search size={15} style={{ color: "#9CA3AF" }} />
            <input
              placeholder="Tìm kiếm..."
              className="bg-transparent flex-1 outline-none"
              style={{ fontSize: "13px", color: "#374151" }}
            />
          </div>

          {/* Notif */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl border hover:bg-gray-50 transition"
              style={{ borderColor: "#E8EBF0" }}
            >
              <Bell size={17} style={{ color: "#374151" }} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: "#E02020" }}
              />
            </button>
            {notifOpen && (
              <div
                className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-xl border py-2 z-50"
                style={{ borderColor: "#E8EBF0" }}
              >
                <p
                  className="px-4 py-2 border-b"
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#111827",
                    borderColor: "#F3F4F6",
                  }}
                >
                  Thông báo
                </p>
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
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
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

          <button
            className="w-9 h-9 flex items-center justify-center rounded-xl border hover:bg-gray-50 transition"
            style={{ borderColor: "#E8EBF0" }}
          >
            <Settings size={17} style={{ color: "#374151" }} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
