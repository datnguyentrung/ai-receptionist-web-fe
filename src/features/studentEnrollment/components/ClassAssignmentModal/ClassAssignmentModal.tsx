import { useEffect, useMemo, useState } from "react";

import { CoachAssignmentSection } from "@/features/studentEnrollment/components/CoachAssignmentSection/CoachAssignmentSection";
import { StudentAssignmentSection } from "../StudentAssignmentSection/StudentAssignmentSection";

import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
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
  CoachAssignmentCreateRequest,
  StudentEnrollmentResponse,
  StudentOverview,
} from "@/types";

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

interface StudentClassAssignmentModalProps {
  mode?: "student";
  onClose?: () => void;
  initialStudent?: StudentOverview | null;
}

interface CoachInlineClassAssignmentModalProps {
  mode: "coach-inline";
  assignmentRequest: CoachAssignmentCreateRequest;
  onAssignmentChange: (next: CoachAssignmentCreateRequest) => void;
  disabled?: boolean;
}

type ClassAssignmentModalProps =
  | StudentClassAssignmentModalProps
  | CoachInlineClassAssignmentModalProps;

export const ClassAssignmentModal = (props: ClassAssignmentModalProps) => {
  const isCoachInline = props.mode === "coach-inline";
  const initialStudent = isCoachInline ? null : (props.initialStudent ?? null);
  const coachAssignmentRequest = isCoachInline ? props.assignmentRequest : null;
  const onCoachAssignmentChange = isCoachInline
    ? props.onAssignmentChange
    : null;
  const isCoachInlineDisabled = isCoachInline ? !!props.disabled : false;

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
    { enabled: shouldFetchSchedules },
  );

  const { data: detailedEnrollments, isLoading: isStudentEnrollmentsLoading } =
    useGetDetailedStudentEnrollmentsByStudentCode(studentCode);

  const createEnrollmentMutation = useCreateStudentEnrollment();
  const deleteEnrollmentMutation = useDeleteStudentEnrollment();

  useEffect(() => {
    if (!fetchedSchedules?.length || typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(
      CLASS_SCHEDULE_CACHE_KEY,
      JSON.stringify(fetchedSchedules),
    );
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

  const activeEnrollments = useMemo<StudentEnrollmentResponse[]>(
    () =>
      detailedEnrollments?.filter(
        (enrollment) => enrollment.status === "ACTIVE",
      ) ?? [],
    [detailedEnrollments],
  );

  const activeScheduleIds = useMemo(
    () =>
      new Set(
        activeEnrollments.map((item) =>
          getSelectionKey(item.classSchedule.scheduleId),
        ),
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
  const selectedCoachScheduleIds = useMemo(
    () => new Set(coachAssignmentRequest?.scheduleIds ?? []),
    [coachAssignmentRequest?.scheduleIds],
  );
  const selectedCoachClasses = useMemo(
    () =>
      classSchedules.filter((schedule) =>
        selectedCoachScheduleIds.has(schedule.scheduleId),
      ),
    [classSchedules, selectedCoachScheduleIds],
  );
  const selectedAddCount = isCoachInline
    ? selectedCoachScheduleIds.size
    : selectedScheduleIds.size;
  const queuedRemovalCount = removalQueue.size;

  const selectedBranchSelectionCount = useMemo(() => {
    const selectedSet = isCoachInline
      ? selectedCoachScheduleIds
      : selectedScheduleIds;

    return selectedBranchClasses.filter((item) =>
      selectedSet.has(item.scheduleId),
    ).length;
  }, [
    isCoachInline,
    selectedBranchClasses,
    selectedCoachScheduleIds,
    selectedScheduleIds,
  ]);

  const handleToggleSchedule = (scheduleId: string) => {
    if (isCoachInline) {
      if (
        !coachAssignmentRequest ||
        !onCoachAssignmentChange ||
        isCoachInlineDisabled
      ) {
        return;
      }

      const next = new Set(coachAssignmentRequest.scheduleIds);
      if (next.has(scheduleId)) {
        next.delete(scheduleId);
      } else {
        next.add(scheduleId);
      }

      onCoachAssignmentChange({
        ...coachAssignmentRequest,
        scheduleIds: Array.from(next),
      });
      return;
    }

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

  const handleQuickResetDate = () => setJoinDate(today);

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

  if (isCoachInline && coachAssignmentRequest && onCoachAssignmentChange) {
    return (
      <CoachAssignmentSection
        assignmentRequest={coachAssignmentRequest}
        onAssignmentChange={onCoachAssignmentChange}
        disabled={isCoachInlineDisabled}
        hasBranchData={hasBranchData}
        resolvedBranchId={resolvedBranchId}
        branchOptions={branchOptions}
        selectedBranchClasses={selectedBranchClasses}
        selectedCoachScheduleIds={selectedCoachScheduleIds}
        selectedCoachClasses={selectedCoachClasses}
        selectedBranchSelectionCount={selectedBranchSelectionCount}
        selectedAddCount={selectedAddCount}
        shouldFetchSchedules={shouldFetchSchedules}
        classSchedulesLength={classSchedules.length}
        today={today}
        onSelectBranch={setSelectedBranchId}
        onToggleSchedule={handleToggleSchedule}
      />
    );
  }

  return initialStudent ? (
    <div className={styles.studentModalShell}>
      <div className={styles.studentModalBody}>
        <StudentAssignmentSection
          student={initialStudent}
          hasBranchData={hasBranchData}
          branchOptions={branchOptions}
          resolvedBranchId={resolvedBranchId}
          selectedBranchClasses={selectedBranchClasses}
          selectedScheduleIds={selectedScheduleIds}
          activeScheduleIds={activeScheduleIds}
          selectedBranchSelectionCount={selectedBranchSelectionCount}
          selectedAddCount={selectedAddCount}
          queuedRemovalCount={queuedRemovalCount}
          shouldFetchSchedules={shouldFetchSchedules}
          classSchedulesLength={classSchedules.length}
          joinDate={joinDate}
          isStudentEnrollmentsLoading={isStudentEnrollmentsLoading}
          activeEnrollments={activeEnrollments}
          removalQueue={removalQueue}
          createEnrollmentPending={createEnrollmentMutation.isPending}
          deleteEnrollmentPending={deleteEnrollmentMutation.isPending}
          onSelectBranch={setSelectedBranchId}
          onJoinDateChange={setJoinDate}
          onQuickResetDate={handleQuickResetDate}
          onToggleSchedule={handleToggleSchedule}
          onAddSelectedClasses={handleAddSelectedClasses}
          onToggleRemoval={handleToggleRemoval}
          onRemoveFromQueue={handleRemoveFromQueue}
          onConfirmRemoval={handleConfirmRemoval}
          onReset={handleReset}
        />
      </div>
    </div>
  ) : null;
};
