import { cn } from "@/components/ui/utils";
import type {
  ClassScheduleSummary,
  CoachAssignmentCreateRequest,
} from "@/types";
import { RotateCcw } from "lucide-react";

import ClassList from "../ClassList/ClassList";
import { StudentScheduleSection } from "../StudentScheduleSection/StudentScheduleSection";
import styles from "./ClassAssignmentModal.module.scss";

type CoachInlineAssignmentSectionProps = {
  assignmentRequest: CoachAssignmentCreateRequest;
  onAssignmentChange: (next: CoachAssignmentCreateRequest) => void;
  disabled: boolean;
  hasBranchData: boolean;
  resolvedBranchId: string;
  branchOptions: Array<{ branchId: number; branchName: string }>;
  selectedBranchClasses: Array<ClassScheduleSummary & { displayLabel: string }>;
  selectedCoachScheduleIds: Set<string>;
  selectedCoachClasses: ClassScheduleSummary[];
  selectedBranchSelectionCount: number;
  selectedAddCount: number;
  shouldFetchSchedules: boolean;
  classSchedulesLength: number;
  today: string;
  onSelectBranch: (value: string) => void;
  onToggleSchedule: (scheduleId: string) => void;
};

export function CoachInlineAssignmentSection({
  assignmentRequest,
  onAssignmentChange,
  disabled,
  hasBranchData,
  resolvedBranchId,
  branchOptions,
  selectedBranchClasses,
  selectedCoachScheduleIds,
  selectedCoachClasses,
  selectedBranchSelectionCount,
  selectedAddCount,
  shouldFetchSchedules,
  classSchedulesLength,
  today,
  onSelectBranch,
  onToggleSchedule,
}: CoachInlineAssignmentSectionProps) {
  const handleFieldChange = (
    key: "assignmentDate" | "endDate" | "note",
    value: string,
  ) => {
    onAssignmentChange({
      ...assignmentRequest,
      [key]: value,
    });
  };

  return (
    <section className={styles.coachInlineSection}>
      <div className={styles.coachInlineGrid}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Chi nhánh</label>
          <select
            className={styles.inputField}
            value={resolvedBranchId}
            onChange={(event) => onSelectBranch(event.target.value)}
            disabled={!hasBranchData || disabled}
          >
            {!hasBranchData ? (
              <option value="">— Không có chi nhánh khả dụng —</option>
            ) : (
              <>
                <option value="">— Chọn chi nhánh —</option>
                {branchOptions.map((branch) => (
                  <option key={branch.branchId} value={branch.branchId}>
                    {branch.branchName}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <div className={styles.field}>
          <div className={styles.fieldLabelRow}>
            <label className={styles.fieldLabel}>Ngày phân công</label>
            <button
              type="button"
              className={styles.inlineTextButton}
              onClick={() => handleFieldChange("assignmentDate", today)}
              disabled={disabled}
            >
              <RotateCcw size={13} /> Hôm nay
            </button>
          </div>
          <input
            type="date"
            className={styles.inputField}
            value={assignmentRequest.assignmentDate}
            onChange={(event) =>
              handleFieldChange("assignmentDate", event.target.value)
            }
            disabled={disabled}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Ngày kết thúc</label>
          <input
            type="date"
            className={styles.inputField}
            value={assignmentRequest.endDate}
            onChange={(event) =>
              handleFieldChange("endDate", event.target.value)
            }
            disabled={disabled}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Ghi chú</label>
          <textarea
            className={styles.textAreaField}
            value={assignmentRequest.note ?? ""}
            onChange={(event) => handleFieldChange("note", event.target.value)}
            placeholder="Ghi chú phân công lớp dạy (tùy chọn)"
            disabled={disabled}
            rows={3}
          />
        </div>
      </div>

      <div className={styles.classSelectionArea}>
        <div className={styles.classSelectionHeader}>
          <label className={styles.fieldLabel}>Lịch dạy (ACTIVE)</label>
          <span className={styles.selectionMeta}>
            {selectedBranchSelectionCount}/{selectedBranchClasses.length} đã
            chọn
          </span>
        </div>
        <div
          className={cn(
            styles.branchScheduleBox,
            !hasBranchData && styles.branchScheduleDisabled,
          )}
        >
          <ClassList
            hasBranch={hasBranchData}
            isLoading={shouldFetchSchedules && classSchedulesLength === 0}
            classList={selectedBranchClasses}
            selectedIds={selectedCoachScheduleIds}
            disabledIds={new Set()}
            onToggle={onToggleSchedule}
            isCompact
            variant="grid"
          />
        </div>
      </div>

      <StudentScheduleSection
        isLoading={false}
        hasOwner
        title="🥋 Lịch dạy đã chọn"
        classList={selectedCoachClasses}
        onDelete={onToggleSchedule}
        actionLabel="Bỏ chọn"
      />

      <div className={styles.selectionSummaryBar}>
        <div>
          <strong>{selectedAddCount}</strong> lớp dạy đang chọn
        </div>
      </div>
    </section>
  );
}
