import { Search } from "lucide-react";
import styles from "./StatusFilters.module.scss";

export type FilterOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  search: string;
  setSearch: (value: string) => void;
  filter: T;
  setFilter: (value: T) => void;
  filterOptions: FilterOption<T>[];
  searchPlaceholder?: string;
  searchWidth?: string;
};

export default function StatusFilters<T extends string>({
  search,
  setSearch,
  filter,
  setFilter,
  filterOptions,
  searchPlaceholder = "Tìm kiếm...",
  searchWidth = "240px",
}: Props<T>) {
  return (
    <div className={styles.filters}>
      <div className={styles.searchBox} style={{ width: searchWidth }}>
        <Search size={14} style={{ color: "#9CA3AF" }} />
        <input
          className={styles.searchInput}
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ fontSize: "13px", color: "#374151" }}
        />
      </div>
      {filterOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setFilter(option.value)}
          className={styles.filterBtn}
          style={{
            borderColor: filter === option.value ? "#E02020" : "#E8EBF0",
            background: filter === option.value ? "#E02020" : "white",
            color: filter === option.value ? "white" : "#6B7280",
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
