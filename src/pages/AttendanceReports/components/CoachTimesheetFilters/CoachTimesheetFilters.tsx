import { CheckboxChip } from "@/components/CheckboxChip";
import type { CoachTimesheetStatus } from "@/config/constants";
import { CoachTimesheetStatusLabel } from "@/config/constants";
import { Calendar, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import barStyles from "../AttendanceFilters/AttendanceFilters.module.scss";
import panelStyles from "../AttendanceFilterPanel/AttendanceFilterPanel.module.scss";

interface CoachTimesheetFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  workDate: string;
  onWorkDateChange: (value: string) => void;
  fromDate: string;
  onFromDateChange: (value: string) => void;
  toDate: string;
  onToDateChange: (value: string) => void;
  month: string;
  onMonthChange: (value: string) => void;
  year: string;
  onYearChange: (value: string) => void;
  branchId: string;
  onBranchIdChange: (value: string) => void;
  status: CoachTimesheetStatus | "";
  onStatusChange: (value: CoachTimesheetStatus | "") => void;
  resultCount: number;
  onClearAll: () => void;
}

type FilterTag = { key: string; label: string; onRemove: () => void };

const COACH_TIMESHEET_STATUS_OPTIONS: CoachTimesheetStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
];

const BRANCH_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

function formatDateTag(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("vi-VN");
}

function clampNumberInput(
  value: string,
  options: { min?: number; max?: number } = {},
) {
  if (!value.trim()) return "";

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return "";
  if (options.min !== undefined && parsed < options.min) return String(options.min);
  if (options.max !== undefined && parsed > options.max) return String(options.max);

  return String(parsed);
}

function CoachTimesheetFilterPanel({
  search,
  onSearchChange,
  workDate,
  onWorkDateChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  month,
  onMonthChange,
  year,
  onYearChange,
  branchId,
  onBranchIdChange,
  status,
  onStatusChange,
  resultCount,
  onClose,
}: CoachTimesheetFiltersProps & { onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className={panelStyles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={panelStyles.panel}>
        <div className={panelStyles.header}>
          <div className={panelStyles.handleBar} aria-hidden="true" />
          <button
            className={panelStyles.closeBtn}
            type="button"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        <div className={panelStyles.body}>
          <div className={panelStyles.section}>
            <h3 className={panelStyles.sectionTitle}>Tìm kiếm & ngày</h3>
            <div className={panelStyles.divider} />
            <div className={panelStyles.inputRow}>
              <label className={panelStyles.inputBox}>
                <Search size={14} className={panelStyles.inputIcon} />
                <input
                  className={panelStyles.textInput}
                  placeholder="Tìm coach, mã lớp..."
                  value={search}
                  onChange={(event) => onSearchChange(event.target.value)}
                />
              </label>
              <label className={panelStyles.inputBox}>
                <Calendar size={14} className={panelStyles.inputIcon} />
                <input
                  type="date"
                  className={panelStyles.textInput}
                  value={workDate}
                  onChange={(event) => onWorkDateChange(event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className={panelStyles.section}>
            <h3 className={panelStyles.sectionTitle}>Khoảng thời gian</h3>
            <div className={panelStyles.divider} />
            <div className={panelStyles.inputRow}>
              <label className={panelStyles.inputBox}>
                <Calendar size={14} className={panelStyles.inputIcon} />
                <input
                  type="date"
                  className={panelStyles.textInput}
                  value={fromDate}
                  onChange={(event) => onFromDateChange(event.target.value)}
                />
              </label>
              <label className={panelStyles.inputBox}>
                <Calendar size={14} className={panelStyles.inputIcon} />
                <input
                  type="date"
                  className={panelStyles.textInput}
                  value={toDate}
                  onChange={(event) => onToDateChange(event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className={panelStyles.section}>
            <h3 className={panelStyles.sectionTitle}>Tháng & cơ sở</h3>
            <div className={panelStyles.divider} />
            <div className={panelStyles.inputRow}>
              <label className={panelStyles.inputBox}>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className={panelStyles.textInput}
                  placeholder="Tháng"
                  value={month}
                  onChange={(event) => onMonthChange(event.target.value)}
                  onBlur={(event) =>
                    onMonthChange(
                      clampNumberInput(event.target.value, { min: 1, max: 12 }),
                    )
                  }
                />
              </label>
              <label className={panelStyles.inputBox}>
                <input
                  type="number"
                  min="2020"
                  className={panelStyles.textInput}
                  placeholder="Năm"
                  value={year}
                  onChange={(event) => onYearChange(event.target.value)}
                  onBlur={(event) =>
                    onYearChange(clampNumberInput(event.target.value, { min: 1900 }))
                  }
                />
              </label>
            </div>
          </div>

          <div className={panelStyles.section}>
            <h3 className={panelStyles.sectionTitle}>Trạng thái</h3>
            <div className={panelStyles.divider} />
            <div className={panelStyles.chipGroup}>
              {COACH_TIMESHEET_STATUS_OPTIONS.map((option) => (
                <CheckboxChip
                  key={option}
                  label={CoachTimesheetStatusLabel[option]}
                  checked={status === option}
                  onChange={() => onStatusChange(status === option ? "" : option)}
                />
              ))}
            </div>
          </div>

          <div className={panelStyles.section}>
            <h3 className={panelStyles.sectionTitle}>Cơ sở</h3>
            <div className={panelStyles.divider} />
            <div className={panelStyles.chipGroup}>
              {BRANCH_OPTIONS.map((option) => (
                <CheckboxChip
                  key={option}
                  label={`Cơ sở ${option}`}
                  checked={branchId === String(option)}
                  onChange={() =>
                    onBranchIdChange(branchId === String(option) ? "" : String(option))
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <div className={panelStyles.footer}>
          <button className={panelStyles.applyBtn} type="button" onClick={onClose}>
            Hiển thị {resultCount} kết quả
          </button>
        </div>
      </div>
    </div>
  );
}

export function CoachTimesheetFilters(props: CoachTimesheetFiltersProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const {
    search,
    onSearchChange,
    workDate,
    onWorkDateChange,
    fromDate,
    onFromDateChange,
    toDate,
    onToDateChange,
    month,
    onMonthChange,
    year,
    onYearChange,
    branchId,
    onBranchIdChange,
    status,
    onStatusChange,
    onClearAll,
  } = props;

  const tags: FilterTag[] = [];

  if (search) {
    tags.push({
      key: `search:${search}`,
      label: `"${search}"`,
      onRemove: () => onSearchChange(""),
    });
  }
  if (workDate) {
    tags.push({
      key: `workDate:${workDate}`,
      label: formatDateTag(workDate),
      onRemove: () => onWorkDateChange(""),
    });
  }
  if (fromDate) {
    tags.push({
      key: `fromDate:${fromDate}`,
      label: `Từ ${formatDateTag(fromDate)}`,
      onRemove: () => onFromDateChange(""),
    });
  }
  if (toDate) {
    tags.push({
      key: `toDate:${toDate}`,
      label: `Đến ${formatDateTag(toDate)}`,
      onRemove: () => onToDateChange(""),
    });
  }
  if (month) {
    tags.push({
      key: `month:${month}`,
      label: `Tháng ${month}`,
      onRemove: () => onMonthChange(""),
    });
  }
  if (year) {
    tags.push({
      key: `year:${year}`,
      label: `Năm ${year}`,
      onRemove: () => onYearChange(""),
    });
  }
  if (branchId) {
    tags.push({
      key: `branch:${branchId}`,
      label: `Cơ sở ${branchId}`,
      onRemove: () => onBranchIdChange(""),
    });
  }
  if (status) {
    tags.push({
      key: `status:${status}`,
      label: CoachTimesheetStatusLabel[status],
      onRemove: () => onStatusChange(""),
    });
  }

  return (
    <>
      <div className={barStyles.bar}>
        <div className={barStyles.barTopRow}>
          <div className={barStyles.barLeft}>
            <button
              className={barStyles.filterToggleBtn}
              type="button"
              onClick={() => setIsPanelOpen(true)}
            >
              <SlidersHorizontal size={14} />
              Bộ lọc
            </button>
            {tags.length > 0 ? (
              <button
                className={barStyles.clearAllBtn}
                type="button"
                onClick={onClearAll}
              >
                Xóa tất cả
              </button>
            ) : null}
          </div>
        </div>

        {tags.length > 0 ? (
          <div className={barStyles.tagList}>
            {tags.map((tag) => (
              <span key={tag.key} className={barStyles.tag}>
                {tag.label}
                <button
                  className={barStyles.tagRemove}
                  type="button"
                  onClick={tag.onRemove}
                  aria-label={`Xóa bộ lọc ${tag.label}`}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {isPanelOpen ? (
        <CoachTimesheetFilterPanel
          {...props}
          onClose={() => setIsPanelOpen(false)}
        />
      ) : null}
    </>
  );
}
