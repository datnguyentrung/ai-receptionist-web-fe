import { Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ClassList from "../ClassList/ClassList";
import StepProgress from "../StepProgress/StepProgress";

import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { cn } from "@/components/ui/utils";
import type {
  ScheduleLevel,
  ScheduleLocation,
  ScheduleShift,
} from "@/config/constants";
import {
  ScheduleLevelLabel,
  ScheduleShiftLabel,
  WeekdayCodeToLabel,
} from "@/config/constants";
import { useGetAllClassSchedules } from "@/features/classSchedule";
import {
  useCreateStudentEnrollment,
  useDeleteStudentEnrollment,
  useGetDetailedStudentEnrollmentsByStudentCode,
} from "@/features/studentEnrollment";
import type {
  ClassScheduleDetail,
  ClassScheduleSummary,
  StudentEnrollmentResponse,
  //  EnrolledClassItem, --- IGNORE ---
  StudentOverview,
} from "@/types";
import { RemovalQueueSection } from "../RemovalQueueSection/RemovalQueueSection";
import { StudentScheduleSection } from "../StudentScheduleSection/StudentScheduleSection";
import styles from "./ClassAssignmentModal.module.scss";

const CLASS_SCHEDULE_CACHE_KEY = "student-enrollment.active-class-schedules";

const formatToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const readCachedSchedules = (): ClassScheduleDetail[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(CLASS_SCHEDULE_CACHE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ClassScheduleDetail[]) : [];
  } catch {
    return [];
  }
};

const getSelectionKey = (scheduleId: string) => scheduleId;

type ScheduleLabelSource = {
  scheduleLevel: ScheduleLevel;
  scheduleShift: ScheduleShift;
  weekday: number;
  startTime: string;
  endTime: string;
};

const buildClassLabel = (schedule: ScheduleLabelSource) => {
  const levelLabel =
    ScheduleLevelLabel[schedule.scheduleLevel] ?? schedule.scheduleLevel;
  const shiftLabel =
    ScheduleShiftLabel[schedule.scheduleShift] ?? schedule.scheduleShift;
  const weekdayLabel =
    WeekdayCodeToLabel[schedule.weekday] ?? `Ngày ${schedule.weekday}`;

  return `${levelLabel} · ${shiftLabel} · ${weekdayLabel} (${schedule.startTime} - ${schedule.endTime})`;
};

type BranchOption = {
  branchId: number;
  branchName: string;
};

interface ClassAssignmentModalProps {
  onClose?: () => void;
  initialStudent?: StudentOverview | null;
}

export const ClassAssignmentModal = ({
  onClose,
  initialStudent,
}: ClassAssignmentModalProps) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [removalQueue, setRemovalQueue] = useState<Set<string>>(
    () => new Set(),
  );
  const [joinDate, setJoinDate] = useState(() => formatToday());
  const today = useMemo(() => formatToday(), []);

  const cachedSchedules = useMemo<ClassScheduleDetail[]>(
    () => readCachedSchedules(),
    [],
  );

  const shouldFetchSchedules = cachedSchedules.length === 0;
  const studentCode = initialStudent?.studentCode ?? "";

  const { data: fetchedSchedules } = useGetAllClassSchedules(
    { scheduleStatus: "ACTIVE" },
    {
      enabled: shouldFetchSchedules,
    },
  );

  const { data: detailedEnrollments, isLoading: isStudentEnrollmentsLoading } =
    useGetDetailedStudentEnrollmentsByStudentCode(studentCode);

  const createEnrollmentMutation = useCreateStudentEnrollment();
  const deleteEnrollmentMutation = useDeleteStudentEnrollment();

  useEffect(() => {
    if (!fetchedSchedules?.length) {
      return;
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        CLASS_SCHEDULE_CACHE_KEY,
        JSON.stringify(fetchedSchedules),
      );
    }
  }, [fetchedSchedules]);

  useEffect(() => {
    setJoinDate(today);
  }, [today]);

  useEffect(() => {
    setSelectedScheduleIds(new Set());
    setRemovalQueue(new Set());
    setSelectedBranchId("");
  }, [studentCode]);

  const classSchedules = useMemo(
    () =>
      cachedSchedules.length > 0 ? cachedSchedules : (fetchedSchedules ?? []),
    [cachedSchedules, fetchedSchedules],
  );

  const activeEnrollments = useMemo<StudentEnrollmentResponse[]>(() => {
    return (
      detailedEnrollments?.filter(
        (enrollment) => enrollment.status === "ACTIVE",
      ) ?? []
    );
  }, [detailedEnrollments]);

  const activeScheduleIds = useMemo(
    () =>
      new Set(
        activeEnrollments.map((item) => getSelectionKey(item.classSchedule.scheduleId)),
      ),
    [activeEnrollments],
  );

  const branchOptions = useMemo<BranchOption[]>(() => {
    const branchMap = new Map<number, string>();

    classSchedules.forEach((schedule) => {
      if (!branchMap.has(schedule.branchId)) {
        branchMap.set(schedule.branchId, schedule.branchName);
      }
    });

    return Array.from(branchMap.entries()).map(([branchId, branchName]) => ({
      branchId,
      branchName,
    }));
  }, [classSchedules]);

  const resolvedBranchId = useMemo(() => {
    if (branchOptions.length === 0) {
      return "";
    }

    const branchStillExists = branchOptions.some(
      (branch) => String(branch.branchId) === selectedBranchId,
    );

    if (selectedBranchId && branchStillExists) {
      return selectedBranchId;
    }

    return String(branchOptions[0].branchId);
  }, [branchOptions, selectedBranchId]);

  const selectedBranchSchedules = useMemo(
    () =>
      classSchedules.filter(
        (schedule) => String(schedule.branchId) === resolvedBranchId,
      ),
    [classSchedules, resolvedBranchId],
  );

  const selectedBranchClasses = useMemo<
    Array<ClassScheduleSummary & { displayLabel: string }>
  >(
    () =>
      selectedBranchSchedules.map((schedule) => ({
        scheduleId: schedule.scheduleId,
        branchName: schedule.branchName,
        scheduleLocation: schedule.scheduleLocation as ScheduleLocation,
        scheduleLevel: schedule.scheduleLevel,
        scheduleShift: schedule.scheduleShift,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        weekday: schedule.weekday,
        displayLabel: buildClassLabel(schedule),
      })),
    [selectedBranchSchedules],
  );

  const hasBranchData = branchOptions.length > 0;
  const selectedAddCount = selectedScheduleIds.size;
  const queuedRemovalCount = removalQueue.size;
  const currentStep = initialStudent ? 2 : 1;

  const selectedBranchSelectionCount = useMemo(() => {
    return selectedBranchClasses.filter((item) =>
      selectedScheduleIds.has(item.scheduleId),
    ).length;
  }, [selectedBranchClasses, selectedScheduleIds]);

  const handleToggleSchedule = (scheduleId: string) => {
    if (activeScheduleIds.has(scheduleId)) {
      return;
    }

    setSelectedScheduleIds((current) => {
      const next = new Set(current);
      if (next.has(scheduleId)) {
        next.delete(scheduleId);
      } else {
        next.add(scheduleId);
      }

      return next;
    });
  };

  const handleQuickResetDate = () => {
    setJoinDate(today);
  };

  const handleAddSelectedClasses = async () => {
    if (!initialStudent) {
      showErrorToast("Vui lòng chọn học viên trước khi xếp lớp.");
      return;
    }

    if (selectedScheduleIds.size === 0) {
      showErrorToast("Chọn ít nhất một lớp để xếp cho học viên.");
      return;
    }

    const scheduleIds = Array.from(selectedScheduleIds);

    try {
      await createEnrollmentMutation.mutateAsync({
        studentId: initialStudent.studentCode,
        scheduleIds,
        joinDate,
      });
      setSelectedScheduleIds(new Set());
      showSuccessToast(
        `Đã xếp ${scheduleIds.length} lớp cho ${initialStudent.fullName}.`,
      );
    } catch {
      showErrorToast("Không thể xếp lớp lúc này. Vui lòng thử lại.");
    }
  };

  const handleToggleRemoval = (enrollmentId: string) => {
    setRemovalQueue((current) => {
      const next = new Set(current);
      if (next.has(enrollmentId)) {
        next.delete(enrollmentId);
      } else {
        next.add(enrollmentId);
      }

      return next;
    });
  };

  const handleRemoveFromQueue = (enrollmentId: string) => {
    setRemovalQueue((current) => {
      const next = new Set(current);
      next.delete(enrollmentId);
      return next;
    });
  };

  const handleConfirmRemoval = async () => {
    if (removalQueue.size === 0) {
      return;
    }

    try {
      const enrollmentIds = Array.from(removalQueue);
      for (const enrollmentId of enrollmentIds) {
        await deleteEnrollmentMutation.mutateAsync(enrollmentId);
      }

      setRemovalQueue(new Set());
      showSuccessToast(`Đã xóa ${enrollmentIds.length} lớp khỏi học viên.`);
    } catch {
      showErrorToast("Không thể xóa lớp lúc này. Vui lòng thử lại.");
    }
  };

  const handleReset = () => {
    setSelectedScheduleIds(new Set());
    setRemovalQueue(new Set());
    setJoinDate(today);
    setSelectedBranchId("");
  };

  return (
    <div className={styles.modal}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBadge}>
            <span>🥋</span>
          </div>
          <div>
            <h1 className={styles.title}>Ghi Danh Võ Sinh</h1>
            <p className={styles.subtitle}>
              Xếp lớp, xóa lớp và điều chỉnh ngày nhập học
            </p>
          </div>
        </div>
        {onClose && (
          <button type="button" className={styles.iconBtn} onClick={onClose}>
            <X size={16} />
          </button>
        )}
      </header>

      <StepProgress currentStep={currentStep} />

      <div className={styles.modalBody}>
        {initialStudent && (
          <section className={styles.studentHero}>
            <div className={styles.fieldLabelRow}>
              <label className={styles.fieldLabel}>
                Võ sinh <span className={styles.redText}>*</span>
              </label>
              <span className={styles.helperPill}>
                {initialStudent.studentStatus}
              </span>
            </div>
            <div className={styles.studentInfoBox}>
              <div className={styles.studentInitial}>
                {initialStudent.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div className={styles.studentInfoText}>
                <div className={styles.studentNameText}>
                  {initialStudent.fullName}
                </div>
                <div className={styles.studentMetaText}>
                  Mã: {initialStudent.studentCode} · {initialStudent.branchName}
                </div>
              </div>
            </div>
          </section>
        )}

        <div className={styles.contentStack}>
          <section className={styles.assignmentPanel}>
            <div className={styles.filterRow}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Chi nhánh</label>
                <select
                  className={styles.inputField}
                  value={resolvedBranchId}
                  onChange={(event) => setSelectedBranchId(event.target.value)}
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
                    onClick={handleQuickResetDate}
                  >
                    <RotateCcw size={13} /> Hôm nay
                  </button>
                </div>
                <input
                  type="date"
                  className={styles.inputField}
                  value={joinDate}
                  onChange={(event) => setJoinDate(event.target.value)}
                />
                <span className={styles.fieldHint}>
                  Mặc định là hôm nay, nhưng bạn có thể chọn ngày khác nếu cần.
                </span>
              </div>

              <button
                type="button"
                className={styles.btnAdd}
                disabled={
                  selectedAddCount === 0 ||
                  !initialStudent ||
                  createEnrollmentMutation.isPending
                }
                onClick={handleAddSelectedClasses}
              >
                <Plus size={18} />
                {createEnrollmentMutation.isPending
                  ? "Đang xếp lớp..."
                  : `Thêm ${selectedAddCount > 0 ? `(${selectedAddCount})` : ""}`}
              </button>

              <div className={styles.classSelectionArea}>
                <div className={styles.classSelectionHeader}>
                  <label className={styles.fieldLabel}>
                    Lịch học chi nhánh
                  </label>
                  <span className={styles.selectionMeta}>
                    {selectedBranchSelectionCount}/
                    {selectedBranchClasses.length} đã chọn
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
                    isLoading={
                      shouldFetchSchedules && classSchedules.length === 0
                    }
                    classList={selectedBranchClasses}
                    selectedIds={selectedScheduleIds}
                    disabledIds={activeScheduleIds}
                    onToggle={handleToggleSchedule}
                    isCompact
                    variant="grid"
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
              !initialStudent && styles.manageSectionDisabled,
            )}
          >
            <StudentScheduleSection
              isLoading={isStudentEnrollmentsLoading}
              hasStudent={!!initialStudent}
              activeDisplayClasses={activeEnrollments}
              onDelete={handleToggleRemoval}
              queuedRemovalIds={removalQueue}
            />

            <RemovalQueueSection
              removalQueue={removalQueue}
              toDeleteObjects={activeEnrollments.filter((item) =>
                removalQueue.has(item.enrollmentId),
              )}
              onRemoveFromQueue={handleRemoveFromQueue}
              onConfirmRemoval={handleConfirmRemoval}
              isProcessing={deleteEnrollmentMutation.isPending}
            />
          </section>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerCaption}>
          {initialStudent ? (
            <>
              Võ sinh:{" "}
              <strong className={styles.footerStrong}>
                {initialStudent.fullName}
              </strong>{" "}
              · {activeEnrollments.length} lớp học hiện tại
            </>
          ) : (
            "Không có học viên được chọn"
          )}
        </div>
        <div className={styles.footerActions}>
          <button
            type="button"
            onClick={handleReset}
            className={cn(styles.btn, styles.btnGhost)}
          >
            Đặt lại
          </button>
        </div>
      </footer>
    </div>
  );
};
