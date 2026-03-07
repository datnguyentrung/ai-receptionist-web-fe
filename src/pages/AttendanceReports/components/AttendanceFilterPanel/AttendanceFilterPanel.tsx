import { CheckboxChip } from "@/components/CheckboxChip";
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
import { Calendar, Search, X } from "lucide-react";
import styles from "./AttendanceFilterPanel.module.scss";

const ATTENDANCE_STATUS_OPTIONS: AttendanceStatus[] = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "EXCUSED",
  "MAKEUP",
];

const EVALUATION_STATUS_OPTIONS: EvaluationStatus[] = [
  "PENDING",
  "GOOD",
  "AVERAGE",
  "WEAK",
];

const BELT_VALUES: Belt[] = [
  "C10",
  "C9",
  "C8",
  "C7",
  "C6",
  "C5",
  "C4",
  "C3",
  "C2",
  "C1",
  "D1",
  "D2",
  "D3",
  "D4",
  "D5",
  "D6",
  "D7",
  "D8",
  "D9",
  "D10",
];

const SCHEDULE_LEVEL_OPTIONS = Object.keys(
  ScheduleLevelLabel,
) as ScheduleLevel[];

const BRANCHES = [1, 2, 3, 4, 5, 6, 7, 8];

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

interface Props {
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
  onClose: () => void;
}

export function AttendanceFilterPanel({
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
  resultCount,
  onClose,
}: Props) {
  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={15} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Search & Date */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Tìm kiếm &amp; Ngày</h3>
            <div className={styles.divider} />
            <div className={styles.inputRow}>
              <div className={styles.inputBox}>
                <Search size={14} className={styles.inputIcon} />
                <input
                  className={styles.textInput}
                  placeholder="Tìm học viên, lớp..."
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
              <div className={styles.inputBox}>
                <Calendar size={14} className={styles.inputIcon} />
                <input
                  type="date"
                  className={styles.textInput}
                  value={dateFilter}
                  onChange={(e) => onDateChange(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Attendance Status */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Trạng thái điểm danh</h3>
            <div className={styles.divider} />
            <div className={styles.chipGroup}>
              {ATTENDANCE_STATUS_OPTIONS.map((s) => (
                <CheckboxChip
                  key={s}
                  label={AttendanceStatusLabel[s]}
                  checked={attendanceStatuses.includes(s)}
                  onChange={() =>
                    onAttendanceStatusesChange(toggle(attendanceStatuses, s))
                  }
                />
              ))}
            </div>
          </div>

          {/* Evaluation Status */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Đánh giá</h3>
            <div className={styles.divider} />
            <div className={styles.chipGroup}>
              {EVALUATION_STATUS_OPTIONS.map((s) => (
                <CheckboxChip
                  key={s}
                  label={EvaluationStatusLabel[s]}
                  checked={evaluationStatuses.includes(s)}
                  onChange={() =>
                    onEvaluationStatusesChange(toggle(evaluationStatuses, s))
                  }
                />
              ))}
            </div>
          </div>

          {/* Belt */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Đai</h3>
            <div className={styles.divider} />
            <div className={styles.chipGroup}>
              {BELT_VALUES.map((belt) => (
                <CheckboxChip
                  key={belt}
                  label={belt}
                  checked={belts.includes(belt)}
                  onChange={() => onBeltsChange(toggle(belts, belt))}
                />
              ))}
            </div>
          </div>

          {/* Branch */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Chi nhánh</h3>
            <div className={styles.divider} />
            <div className={styles.chipGroup}>
              {BRANCHES.map((b) => (
                <CheckboxChip
                  key={b}
                  label={`Chi nhánh ${b}`}
                  checked={branches.includes(b)}
                  onChange={() => onBranchesChange(toggle(branches, b))}
                />
              ))}
            </div>
          </div>

          {/* Schedule Level */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Cấp độ lớp</h3>
            <div className={styles.divider} />
            <div className={styles.chipGroup}>
              {SCHEDULE_LEVEL_OPTIONS.map((level) => (
                <CheckboxChip
                  key={level}
                  label={ScheduleLevelLabel[level]}
                  checked={scheduleLevels.includes(level)}
                  onChange={() =>
                    onScheduleLevelsChange(toggle(scheduleLevels, level))
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.applyBtn} onClick={onClose}>
            Hiển thị {resultCount} kết quả
          </button>
        </div>
      </div>
    </div>
  );
}
