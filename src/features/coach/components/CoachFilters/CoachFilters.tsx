import { Search } from "lucide-react";
import styles from "./CoachFilters.module.scss";

type Props = {
  search: string;
  setSearch: (value: string) => void;
  filter: "all" | "active" | "on-leave" | "inactive";
  setFilter: (value: "all" | "active" | "on-leave" | "inactive") => void;
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
      {(["all", "active", "on-leave", "inactive"] as const).map((f) => (
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
          {f === "all"
            ? "Tất cả"
            : f === "active"
              ? "Đang hoạt động"
              : f === "on-leave"
                ? "Nghỉ phép"
                : "Tạm nghỉ"}
        </button>
      ))}
    </div>
  );
}
