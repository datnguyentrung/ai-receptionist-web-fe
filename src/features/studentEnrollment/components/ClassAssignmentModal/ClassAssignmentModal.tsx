import { Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ClassList from "../ClassList/ClassList";
import StepProgress from "../StepProgress/StepProgress";

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
import type {
  ClassScheduleDetail,
  ClassScheduleSummary,
  StudentOverview,
} from "@/types";
import { RemovalQueueSection } from "../RemovalQueueSection/RemovalQueueSection";
import { StudentScheduleSection } from "../StudentScheduleSection/StudentScheduleSection";
import styles from "./ClassAssignmentModal.module.scss";
import type { EnrolledClassItem } from "./types";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const today = useMemo(() => formatToday(), []);
  const cachedSchedules = useMemo<ClassScheduleDetail[]>(
    () => readCachedSchedules(),
    [],
  );
  const toDeleteObjects = useMemo<EnrolledClassItem[]>(() => [], []);
  const removalQueue = useMemo(() => new Set<string>(), []);

  const shouldFetchSchedules = cachedSchedules.length === 0;

  const { data: fetchedSchedules } = useGetAllClassSchedules(
    { scheduleStatus: "ACTIVE" },
    {
      enabled: shouldFetchSchedules,
    },
  );

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

  const classSchedules = useMemo(
    () =>
      cachedSchedules.length > 0 ? cachedSchedules : (fetchedSchedules ?? []),
    [cachedSchedules, fetchedSchedules],
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

  const handleReset = () => {
    setCurrentStep(1);
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
            <p className={styles.subtitle}>Xếp lớp học cho học viên</p>
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
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              Võ sinh <span className={styles.redText}>*</span>
            </label>
            <div className={styles.studentInfoBox}>
              <div className={styles.studentInitial}>
                {initialStudent.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className={styles.studentNameText}>
                  {initialStudent.fullName}
                </div>
                <div className={styles.studentMetaText}>
                  Mã: {initialStudent.studentCode} · {initialStudent.branchName}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.contentStack}>
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
              <label className={styles.fieldLabel}>Ngày nhập học</label>
              <input
                type="date"
                className={styles.inputField}
                value={today}
                onChange={() => undefined}
                disabled
              />
            </div>

            <button
              className={styles.btnAdd}
              disabled
              onClick={() => undefined}
            >
              <Plus size={18} /> Thêm
            </button>

            <div className={styles.classSelectionArea}>
              <label className={styles.fieldLabel}>Lịch học chi nhánh</label>
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
                  selectedIds={new Set()}
                  isCompact
                />
              </div>
            </div>
          </div>

          <div
            className={cn(
              styles.manageSection,
              !initialStudent && styles.manageSectionDisabled,
            )}
          >
            <StudentScheduleSection
              isLoading={false}
              hasStudent={!!initialStudent}
              activeDisplayClasses={initialStudent?.classSchedules || []}
              onDelete={() => undefined}
            />

            <RemovalQueueSection
              removalQueue={removalQueue}
              toDeleteObjects={toDeleteObjects}
              onRemoveFromQueue={() => undefined}
              onConfirmRemoval={() => undefined}
              isProcessing={false}
            />
          </div>
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
              · {initialStudent?.classSchedules.length || 0} lớp học
            </>
          ) : (
            "Không có học viên được chọn"
          )}
        </div>
        <div className={styles.footerActions}>
          <button
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
