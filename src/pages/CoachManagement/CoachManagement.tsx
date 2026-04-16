import {
  CoachCard,
  CoachFilters,
  useCoachesGroupedByRole,
  useGetAllCoaches,
} from "@/features/coach";
import { Plus, Users } from "lucide-react";
import { useState } from "react";
import type { CoachStatus } from "../../config/constants";
import styles from "./CoachManagement.module.scss";

export function CoachManagement() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | CoachStatus>("all");

  const { data: coaches, isLoading } = useGetAllCoaches();

  const coachGroups = useCoachesGroupedByRole(coaches || [], search, filter);

  // Calculate filteredCoaches from groups to ensure consistency
  const filteredCoaches = coachGroups.flatMap((group) => group.coaches);

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
            {filteredCoaches.filter((c) => c.status === "ACTIVE").length} đang
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

      {/* Coach groups */}
      {coachGroups.length > 0 ? (
        <div className={styles.coachGroups}>
          {coachGroups.map((group) => (
            <div key={group.roleCode} className={styles.roleGroup}>
              <h3 className={styles.roleGroupHeader}>{group.label}</h3>
              <div className={styles.coachGrid}>
                {group.coaches.map((coach) => (
                  <CoachCard key={coach.staffCode} coach={coach} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
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
