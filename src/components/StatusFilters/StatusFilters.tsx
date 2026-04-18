import { Search } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
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
  optionState?: Partial<Record<T, { disabled: boolean; hoverText: string }>>;
  searchPlaceholder?: string;
  searchWidth?: string;
};

export default function StatusFilters<T extends string>({
  search,
  setSearch,
  filter,
  setFilter,
  filterOptions,
  optionState,
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
      {filterOptions.map((option) => {
        const state = optionState?.[option.value];
        const isDisabled = state?.disabled ?? false;
        const isActive = filter === option.value;

        const filterButton = (
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => setFilter(option.value)}
            className={styles.filterBtn}
            style={{
              borderColor: isActive ? "#E02020" : "#E8EBF0",
              background: isActive ? "#E02020" : "white",
              color: isActive ? "white" : "#6B7280",
            }}
          >
            {option.label}
          </button>
        );

        if (!isDisabled) {
          return <div key={option.value}>{filterButton}</div>;
        }

        return (
          <HoverCard key={option.value} openDelay={120} closeDelay={60}>
            <HoverCardTrigger asChild>
              <span className={styles.filterHoverWrap}>{filterButton}</span>
            </HoverCardTrigger>
            <HoverCardContent className={styles.filterHoverCard} align="start">
              <p className={styles.filterHoverText}>
                {state?.hoverText ??
                  "Hiện chưa có học viên nào thuộc trạng thái này trong phạm sự của bạn."}
              </p>
            </HoverCardContent>
          </HoverCard>
        );
      })}
    </div>
  );
}
