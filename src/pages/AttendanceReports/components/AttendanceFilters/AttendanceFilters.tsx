import type { Belt, ScheduleLevel } from "@/config/constants/CoreEnums";
import { ScheduleLevelLabel } from "@/config/constants/CoreEnums";
import type {
  AttendanceStatus,
  EvaluationStatus,
} from "@/config/constants/OperationEnums";
import {
  AttendanceStatusLabel,
  EvaluationStatusLabel,
} from "@/config/constants/OperationEnums";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { AttendanceFilterPanel } from "../AttendanceFilterPanel/AttendanceFilterPanel";
import styles from "./AttendanceFilters.module.scss";

export interface AttendanceFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  dateFilter: string;
  onDateChange: (v: string) => void;
  attendanceStatuses: AttendanceStatus[];
  onAttendanceStatusesChange: (v: AttendanceStatus[]) => void;
  evaluationStatuses: EvaluationStatus[];
  onEvaluationStatusesChange: (v: EvaluationStatus[]) => void;
  belts: Belt[];
  onBeltsChange: (v: Belt[]) => void;
  branches: number[];
  onBranchesChange: (v: number[]) => void;
  scheduleLevels: ScheduleLevel[];
  onScheduleLevelsChange: (v: ScheduleLevel[]) => void;
  resultCount: number;
  onClearAll: () => void;
}

type FilterTag = { key: string; label: string; onRemove: () => void };

export function AttendanceFilters(props: AttendanceFiltersProps) {
  const {
    search,
    onSearchChange,
    dateFilter,
    onDateChange,
    attendanceStatuses,
    onAttendanceStatusesChange,
    evaluationStatuses,
    onEvaluationStatusesChange,
    belts,
    onBeltsChange,
    branches,
    onBranchesChange,
    scheduleLevels,
    onScheduleLevelsChange,
    onClearAll,
  } = props;

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const tags: FilterTag[] = [];

  if (search)
    tags.push({
      key: `s:${search}`,
      label: `“${search}”`,
      onRemove: () => onSearchChange(""),
    });
  if (dateFilter)
    tags.push({
      key: `d:${dateFilter}`,
      label: new Date(dateFilter + "T00:00:00").toLocaleDateString("vi-VN"),
      onRemove: () => onDateChange(""),
    });
  attendanceStatuses.forEach((s) =>
    tags.push({
      key: `as:${s}`,
      label: AttendanceStatusLabel[s],
      onRemove: () =>
        onAttendanceStatusesChange(attendanceStatuses.filter((x) => x !== s)),
    }),
  );
  evaluationStatuses.forEach((s) =>
    tags.push({
      key: `es:${s}`,
      label: EvaluationStatusLabel[s],
      onRemove: () =>
        onEvaluationStatusesChange(evaluationStatuses.filter((x) => x !== s)),
    }),
  );
  belts.forEach((b) =>
    tags.push({
      key: `belt:${b}`,
      label: b,
      onRemove: () => onBeltsChange(belts.filter((x) => x !== b)),
    }),
  );
  branches.forEach((b) =>
    tags.push({
      key: `br:${b}`,
      label: `Chi nhánh ${b}`,
      onRemove: () => onBranchesChange(branches.filter((x) => x !== b)),
    }),
  );
  scheduleLevels.forEach((l) =>
    tags.push({
      key: `sl:${l}`,
      label: ScheduleLevelLabel[l],
      onRemove: () =>
        onScheduleLevelsChange(scheduleLevels.filter((x) => x !== l)),
    }),
  );

  return (
    <>
      <div className={styles.bar}>
        <div className={styles.barLeft}>
          <button
            className={styles.filterToggleBtn}
            onClick={() => setIsPanelOpen(true)}
          >
            <SlidersHorizontal size={14} />
            Bộ lọc
          </button>
          {tags.length > 0 && (
            <button className={styles.clearAllBtn} onClick={onClearAll}>
              Xóa tất cả
            </button>
          )}
        </div>
        {tags.length > 0 && (
          <div className={styles.tagList}>
            {tags.map((tag) => (
              <span key={tag.key} className={styles.tag}>
                {tag.label}
                <button
                  className={styles.tagRemove}
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
        <AttendanceFilterPanel
          {...props}
          onClose={() => setIsPanelOpen(false)}
        />
      )}
    </>
  );
}
