import Sidebar from "@/components/Sidebar/Sidebar";
import { useState } from "react";
import { Outlet } from "react-router";
import Header from "../../components/Header/Header";
import styles from "./MainLayout.module.scss";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
