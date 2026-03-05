import type { CoachStatus } from "@/config/constants";
import { Search } from "lucide-react";
import styles from "./CoachFilters.module.scss";

const FILTER_OPTIONS: ("all" | CoachStatus)[] = [
  "all",
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "RETIRED",
];

const STATUS_LABELS: Record<"all" | CoachStatus, string> = {
  all: "Tất cả",
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Tạm nghỉ",
  SUSPENDED: "Đình chỉ",
  RETIRED: "Đã nghỉ hưu", // Hoặc "Nghỉ việc" tùy nghiệp vụ của bạn
};

type Props = {
  search: string;
  setSearch: (value: string) => void;
  filter: "all" | CoachStatus;
  setFilter: (value: "all" | CoachStatus) => void;
};

export default function CoachFilters({
  search,
  setSearch,
  filter,
  setFilter,
}: Props) {
  return (
    <div className={styles.filters}>
      <div className={styles.searchBox} style={{ width: "240px" }}>
        <Search size={14} style={{ color: "#9CA3AF" }} />
        <input
          className={styles.searchInput}
          placeholder="Tìm huấn luyện viên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ fontSize: "13px", color: "#374151" }}
        />
      </div>
      {FILTER_OPTIONS.map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={styles.filterBtn}
          style={{
            borderColor: filter === f ? "#E02020" : "#E8EBF0",
            background: filter === f ? "#E02020" : "white",
            color: filter === f ? "white" : "#6B7280",
          }}
        >
          {STATUS_LABELS[f]}
        </button>
      ))}
    </div>
  );
}
