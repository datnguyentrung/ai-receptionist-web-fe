import type { Belt, StudentStatus } from "@/config/constants";
import { BeltLabel } from "@/config/constants";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "../StudentManagement.module.scss";

type StudentFilter = "all" | StudentStatus;

type StudentFilterOption = {
  value: StudentFilter;
  label: string;
};

type StudentFilterState = Partial<
  Record<StudentFilter, { disabled: boolean; hoverText: string }>
>;

interface StudentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: StudentFilter;
  onFilterChange: (value: StudentFilter) => void;
  filterOptions: StudentFilterOption[];
  optionState?: StudentFilterState;
  belts: Belt[];
  onBeltsChange: (value: Belt[]) => void;
  resultCount: number;
  onClearAll: () => void;
}

const BELT_OPTIONS = Object.keys(BeltLabel) as Belt[];

function toggleValue<T>(values: T[], value: T) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function StudentFilterChip({
  label,
  checked,
  disabled,
  onClick,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.studentFilterChip} ${
        checked ? styles["studentFilterChip--active"] : ""
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function StudentFilterPanel({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  filterOptions,
  optionState,
  belts,
  onBeltsChange,
  resultCount,
  onClose,
}: StudentFiltersProps & { onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className={styles.studentFilterOverlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.studentFilterPanel}>
        <div className={styles.studentFilterPanelHeader}>
          <div className={styles.studentFilterHandle} aria-hidden="true" />
          <button
            type="button"
            className={styles.studentFilterClose}
            onClick={onClose}
            aria-label="Đóng bộ lọc"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.studentFilterPanelBody}>
          <div className={styles.studentFilterSection}>
            <h3 className={styles.studentFilterTitle}>Tìm học viên</h3>
            <div className={styles.studentFilterInput}>
              <Search size={14} className={styles.studentFilterInputIcon} />
              <input
                className={styles.studentFilterTextInput}
                placeholder="Tên, mã, lớp, HLV..."
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          </div>

          <div className={styles.studentFilterSection}>
            <h3 className={styles.studentFilterTitle}>Trạng thái học viên</h3>
            <div className={styles.studentFilterChipGroup}>
              {filterOptions.map((option) => {
                const state = optionState?.[option.value];
                return (
                  <StudentFilterChip
                    key={option.value}
                    label={option.label}
                    checked={filter === option.value}
                    disabled={state?.disabled}
                    onClick={() => onFilterChange(option.value)}
                  />
                );
              })}
            </div>
          </div>

          <div className={styles.studentFilterSection}>
            <h3 className={styles.studentFilterTitle}>Cấp đai</h3>
            <div className={styles.studentFilterChipGroup}>
              {BELT_OPTIONS.map((belt) => (
                <StudentFilterChip
                  key={belt}
                  label={BeltLabel[belt] ?? belt}
                  checked={belts.includes(belt)}
                  onClick={() => onBeltsChange(toggleValue(belts, belt))}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.studentFilterFooter}>
          <button
            type="button"
            className={styles.studentFilterApply}
            onClick={onClose}
          >
            Hiển thị {resultCount} kết quả
          </button>
        </div>
      </div>
    </div>
  );
}

export function StudentFilters(props: StudentFiltersProps) {
  const {
    search,
    onSearchChange,
    filter,
    onFilterChange,
    filterOptions,
    belts,
    onBeltsChange,
    onClearAll,
  } = props;
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const activeStatus = filterOptions.find((option) => option.value === filter);
  const tags = [
    search
      ? {
          key: "search",
          label: `"${search}"`,
          onRemove: () => onSearchChange(""),
        }
      : null,
    filter !== "all" && activeStatus
      ? {
          key: "status",
          label: activeStatus.label,
          onRemove: () => onFilterChange("all"),
        }
      : null,
    ...belts.map((belt) => ({
      key: `belt:${belt}`,
      label: BeltLabel[belt] ?? belt,
      onRemove: () => onBeltsChange(belts.filter((item) => item !== belt)),
    })),
  ].filter(
    (tag): tag is { key: string; label: string; onRemove: () => void } =>
      tag !== null,
  );

  return (
    <>
      <div className={styles.studentFilterBar}>
        <div className={styles.studentFilterTopRow}>
          <div className={styles.studentFilterLeft}>
            <button
              type="button"
              className={styles.studentFilterToggle}
              onClick={() => setIsPanelOpen(true)}
            >
              <SlidersHorizontal size={15} />
              Bộ lọc
              {tags.length > 0 && (
                <span className={styles.studentFilterCount}>{tags.length}</span>
              )}
            </button>
            {tags.length > 0 && (
              <button
                type="button"
                className={styles.studentFilterClear}
                onClick={onClearAll}
              >
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        {tags.length > 0 && (
          <div className={styles.studentFilterTags}>
            {tags.map((tag) => (
              <span key={tag.key} className={styles.studentFilterTag}>
                {tag.label}
                <button
                  type="button"
                  className={styles.studentFilterTagRemove}
                  onClick={tag.onRemove}
                  aria-label={`Xóa bộ lọc ${tag.label}`}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {isPanelOpen && (
        <StudentFilterPanel {...props} onClose={() => setIsPanelOpen(false)} />
      )}
    </>
  );
}
