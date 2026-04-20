import { AssignmentSubjectHero } from "@/components/AssignmentSubjectHero/AssignmentSubjectHero";
import { cn } from "@/components/ui/utils";
import type {
  ClassScheduleSummary,
  StudentEnrollmentResponse,
  StudentOverview,
} from "@/types";
import { Plus, RotateCcw } from "lucide-react";

import styles from "../ClassAssignmentModal/ClassAssignmentModal.module.scss";
import ClassList from "../ClassList/ClassList";
import { RemovalQueueSection } from "../RemovalQueueSection/RemovalQueueSection";
import { StudentScheduleSection } from "../StudentScheduleSection/StudentScheduleSection";

type BranchOption = {
  branchId: number;
  branchName: string;
};

type StudentAssignmentSectionProps = {
  student: StudentOverview;
  hasBranchData: boolean;
  branchOptions: BranchOption[];
  resolvedBranchId: string;
  selectedBranchClasses: Array<ClassScheduleSummary & { displayLabel: string }>;
  selectedScheduleIds: Set<string>;
  activeScheduleIds: Set<string>;
  selectedBranchSelectionCount: number;
  selectedAddCount: number;
  queuedRemovalCount: number;
  shouldFetchSchedules: boolean;
  classSchedulesLength: number;
  joinDate: string;
  isStudentEnrollmentsLoading: boolean;
  activeEnrollments: StudentEnrollmentResponse[];
  removalQueue: Set<string>;
  createEnrollmentPending: boolean;
  deleteEnrollmentPending: boolean;
  onSelectBranch: (value: string) => void;
  onJoinDateChange: (value: string) => void;
  onQuickResetDate: () => void;
  onToggleSchedule: (scheduleId: string) => void;
  onAddSelectedClasses: () => void;
  onToggleRemoval: (enrollmentId: string) => void;
  onRemoveFromQueue: (enrollmentId: string) => void;
  onConfirmRemoval: () => void;
  onReset: () => void;
};

export function StudentAssignmentSection({
  student,
  hasBranchData,
  branchOptions,
  resolvedBranchId,
  selectedBranchClasses,
  selectedScheduleIds,
  activeScheduleIds,
  selectedBranchSelectionCount,
  selectedAddCount,
  queuedRemovalCount,
  shouldFetchSchedules,
  classSchedulesLength,
  joinDate,
  isStudentEnrollmentsLoading,
  activeEnrollments,
  removalQueue,
  createEnrollmentPending,
  deleteEnrollmentPending,
  onSelectBranch,
  onJoinDateChange,
  onQuickResetDate,
  onToggleSchedule,
  onAddSelectedClasses,
  onToggleRemoval,
  onRemoveFromQueue,
  onConfirmRemoval,
  onReset,
}: StudentAssignmentSectionProps) {
  return (
    <>
      <AssignmentSubjectHero
        subjectLabel="Võ sinh"
        statusText={student.studentStatus}
        name={student.fullName}
        codeLabel="Mã"
        codeValue={student.studentCode}
        secondaryText={student.branchName}
      />

      <div className={styles.contentStack}>
        <section className={styles.assignmentPanel}>
          <div className={styles.filterRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Chi nhánh</label>
              <select
                className={styles.inputField}
                value={resolvedBranchId}
                onChange={(event) => onSelectBranch(event.target.value)}
                disabled={!hasBranchData}
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
                <label className={styles.fieldLabel}>Ngày nhập học</label>
                <button
                  type="button"
                  className={styles.inlineTextButton}
                  onClick={onQuickResetDate}
                >
                  <RotateCcw size={13} /> Hôm nay
                </button>
              </div>
              <input
                type="date"
                className={styles.inputField}
                value={joinDate}
                onChange={(event) => onJoinDateChange(event.target.value)}
              />
              <span className={styles.fieldHint}>
                Mặc định là hôm nay, nhưng bạn có thể chọn ngày khác nếu cần.
              </span>
            </div>

            <button
              type="button"
              className={styles.btnAdd}
              disabled={
                selectedAddCount === 0 || createEnrollmentPending || !student
              }
              onClick={onAddSelectedClasses}
            >
              <Plus size={18} />
              {createEnrollmentPending
                ? "Đang xếp lớp..."
                : `Thêm ${selectedAddCount > 0 ? `(${selectedAddCount})` : ""}`}
            </button>

            <div className={styles.classSelectionArea}>
              <div className={styles.classSelectionHeader}>
                <label className={styles.fieldLabel}>Lịch học chi nhánh</label>
                <span className={styles.selectionMeta}>
                  {selectedBranchSelectionCount}/{selectedBranchClasses.length}{" "}
                  đã chọn
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
                  selectedIds={selectedScheduleIds}
                  disabledIds={activeScheduleIds}
                  onToggle={onToggleSchedule}
                  isCompact
                  variant="grid"
                  gridColumns={3}
                />
              </div>
            </div>
          </div>

          <div className={styles.selectionSummaryBar}>
            <div>
              <strong>{selectedAddCount}</strong> lớp đang chờ xếp
            </div>
            <div>
              <strong>{queuedRemovalCount}</strong> lớp đang chờ xóa
            </div>
          </div>
        </section>

        <section
          className={cn(
            styles.manageSection,
            !student && styles.manageSectionDisabled,
          )}
        >
          <StudentScheduleSection
            isLoading={isStudentEnrollmentsLoading}
            hasStudent
            activeDisplayClasses={activeEnrollments}
            onDelete={onToggleRemoval}
            queuedRemovalIds={removalQueue}
          />

          <RemovalQueueSection
            removalQueue={removalQueue}
            toDeleteObjects={activeEnrollments.filter((item) =>
              removalQueue.has(item.enrollmentId),
            )}
            onRemoveFromQueue={onRemoveFromQueue}
            onConfirmRemoval={onConfirmRemoval}
            isProcessing={deleteEnrollmentPending}
          />
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerCaption}>
          Võ sinh:{" "}
          <strong className={styles.footerStrong}>{student.fullName}</strong>·{" "}
          {activeEnrollments.length} lớp học hiện tại
        </div>
        <div className={styles.footerActions}>
          <button
            type="button"
            onClick={onReset}
            className={cn(styles.btn, styles.btnGhost)}
          >
            Đặt lại
          </button>
        </div>
      </footer>
    </>
  );
}
