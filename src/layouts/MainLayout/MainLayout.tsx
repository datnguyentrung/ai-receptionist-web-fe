import Sidebar from "@/components/Sidebar/Sidebar";
import { useGetUserInfo } from "@/features/auth/api/useUser";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import Header from "../../components/Header/Header";
import styles from "./MainLayout.module.scss";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { data: userInfo, isLoading, isError } = useGetUserInfo();

  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo) {
      setUserProfile(userInfo);
    }
  }, [userInfo, setUserProfile]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        {/* Thay bằng component Spinner/Loading của dự án */}
        <p>Đang tải dữ liệu người dùng...</p>
      </div>
    );
  }

  // Nếu lỗi (ví dụ token hết hạn, backend lỗi), có thể xử lý logout ở đây
  if (isError) {
    // Gọi hàm clearAuth() và đá về /login (tùy logic của bạn)
    clearAuth();
    navigate("/login");
  }

  return (
    <div className={styles.layout}>
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* ── Main content ── */}
      <div className={styles.main}>
        {/* Top header */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Page content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
