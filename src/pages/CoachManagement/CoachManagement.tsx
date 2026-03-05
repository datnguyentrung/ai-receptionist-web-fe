import type { CoachDTO } from "@/data/mockData";
import { useGetAllCoaches } from "@/features/coach/api/useCoach";
import CoachCard from "@/features/coach/components/CoachCard/CoachCard";
import { Plus, Users } from "lucide-react";
import { useState } from "react";
import CoachFilters from "../../features/coach/components/CoachFilters/CoachFilters";
import { useFilteredCoaches } from "../../features/coach/hooks/useFilteredCoaches";
import styles from "./CoachManagement.module.scss";

export function CoachManagement() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | CoachDTO["status"]>("all");

  const { data: coaches, isLoading } = useGetAllCoaches();

  const filteredCoaches = useFilteredCoaches(coaches || [], search, filter);

  if (isLoading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <div className={styles.page}>
      {/* Header row */}
      <div className={styles.pageHead}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
            Quản lý Huấn luyện viên
          </h2>
          <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
            {filteredCoaches.length} huấn luyện viên ·{" "}
            {filteredCoaches.filter((c) => c.status === "active").length} đang
            hoạt động
          </p>
        </div>
        <button className={styles.addBtn}>
          <Plus size={16} /> Thêm HLV mới
        </button>
      </div>

      {/* Filters */}
      <CoachFilters
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
      />

      {/* Coach cards grid */}
      <div className={styles.coachGrid}>
        {filteredCoaches.map((coach) => (
          <CoachCard key={coach.staffCode} coach={coach} />
        ))}
      </div>

      {filteredCoaches.length === 0 && (
        <div className={styles.emptyState}>
          <Users
            size={40}
            style={{ color: "#D1D5DB", margin: "0 auto 12px" }}
          />
          <p style={{ fontSize: "14px", color: "#9CA3AF" }}>
            Không tìm thấy huấn luyện viên
          </p>
        </div>
      )}
    </div>
  );
}
