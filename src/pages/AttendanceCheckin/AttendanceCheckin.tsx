import ConfirmModal from "@/components/ConfirmModal";
import { useRegisterPullToRefresh } from "@/components/PullToRefresh";
import { RenderProfiler } from "@/components/dev/RenderProfiler";
import { Skeleton } from "@/components/ui/skeleton";
import { isPWA } from "@/config/appMode";
import type {
  AttendanceStatus,
  Belt,
  EvaluationStatus,
} from "@/config/constants";
import { BeltLabel } from "@/config/constants";
import { CLASS_SESSION } from "@/data/mockData";
import { EvalSheet } from "@/features/studentAttendance";
import { canEvaluateAttendance } from "@/features/studentAttendance/evaluationRules";
import { studentAttendanceAPI } from "@/features/studentAttendance/api/studentAttendanceAPI";
import { studentEnrollmentAPI } from "@/features/studentEnrollment/api/studentEnrollmentAPI";
import { useGetQuery, usePlainMutation } from "@/hooks/useCrud";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import type {
  AttendanceListResponse,
  AttendanceUpdateEvaluationRequest,
  AttendanceUpdateStatusRequest,
  ClassScheduleSummary,
  StudentAttendanceResponse,
} from "@/types";
import { mergeAttendanceData } from "@/utils/mergeAttendanceData";
import { useRoleStudent } from "@/utils/roleUtils";
import { RefreshCcw, Users } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import styles from "./AttendanceCheckin.module.scss";
import {
  attendanceRecordsQueryKey,
  attendanceStudentsQueryKey,
  getAttendanceSessionDate,
} from "./attendanceCheckinQueries";
import { AttendanceHeader } from "./components/AttendanceHeader";
import { BottomBar } from "./components/BottomBar";
import { StudentCard } from "./components/StudentCard";
import { SuccessOverlay } from "./components/SuccessOverlay";

type BeltFilter = "all" | "unknown" | Belt;
type BeltOptionKey = Exclude<BeltFilter, "all">;
type BeltSort = "asc" | "desc";
type StudentAttendanceWithBelt = StudentAttendanceResponse & {
  belt?: Belt | null;
};

const BELT_ORDER: Belt[] = [
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

function getBeltRank(belt: Belt | null | undefined) {
  const rank = belt ? BELT_ORDER.indexOf(belt) : -1;
  return rank >= 0 ? rank : BELT_ORDER.length;
}

function readBelt(source: unknown): Belt | null {
  const belt = (source as { belt?: unknown } | null)?.belt;
  return typeof belt === "string" && belt in BeltLabel ? (belt as Belt) : null;
}

function nowTime() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shouldSetCheckInTime(status: AttendanceStatus | null) {
  return status === "PRESENT" || status === "LATE";
}

function mergeAttendanceIntoList(
  old: AttendanceListResponse | undefined,
  updatedAttendance: StudentAttendanceResponse,
) {
  if (!old) {
    return old;
  }

  return {
    ...old,
    attendances: {
      ...old.attendances,
      content: old.attendances.content.map((student) =>
        student.studentId === updatedAttendance.studentId ||
        student.attendanceId === updatedAttendance.attendanceId
          ? { ...student, ...updatedAttendance }
          : student,
      ),
    },
  };
}

function StudentListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonCardRow}>
            <Skeleton className={styles.skeletonAvatar} />
            <div className={styles.skeletonCardInfo}>
              <Skeleton className={styles.skeletonName} />
              <Skeleton className={styles.skeletonMeta} />
            </div>
          </div>
          <div className={styles.skeletonPills}>
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className={styles.skeletonPill} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function AttendanceHeaderSkeleton() {
  return (
    <div className={styles.skeletonSidebar}>
      <Skeleton className={styles.skeletonTitle} />
      <Skeleton className={styles.skeletonSubtitle} />
      <Skeleton className={styles.skeletonProgress} />
      <div className={styles.skeletonStatRow}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className={styles.skeletonStat} />
        ))}
      </div>
      <Skeleton className={styles.skeletonFilterBar} />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.emptyState}>
      <Users size={40} style={{ color: "#E5E7EB", margin: "0 auto 10px" }} />
      <p className={styles.emptyText}>Không thể tải danh sách học viên.</p>
      <button type="button" className={styles.retryButton} onClick={onRetry}>
        <RefreshCcw size={14} />
        Thử lại
      </button>
    </div>
  );
}

// -- Main component ---------------------------------------------
export function AttendanceCheckin() {
  // Local edits (attendanceStatus, evaluationStatus, note, checkInTime) keyed by studentId
  const [mutations, setMutations] = useState<
    Record<string, Partial<StudentAttendanceResponse>>
  >({});
  const [evalTarget, setEvalTarget] =
    useState<StudentAttendanceResponse | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedTime, setSubmittedTime] = useState("");
  const [filter, setFilter] = useState<"all" | AttendanceStatus>("all");
  const [beltFilter, setBeltFilter] = useState<BeltFilter>("all");
  const [beltSort, setBeltSort] = useState<BeltSort>("asc");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitPending, setIsSubmitPending] = useState(false);
  const submitTimeoutRef = useRef<number | null>(null);
  const queryClient = useQueryClient();

  const { canViewManagerSenior } = useRoleStudent();

  const { scheduleId } = useParams();
  const location = useLocation();
  const routeState = location.state as
    | { classScheduleSummary?: ClassScheduleSummary }
    | null;
  const user = useAuthStore((state) => state.activeProfile);
  const allowedScheduleIds =
    user?.userInfo?.assignedClasses
      ?.map((c) => c?.classSchedule?.scheduleId)
      ?.filter((id): id is string => Boolean(id)) ?? [];
  const hasScheduleParam = !!scheduleId;
  const hasScheduleAccess =
    hasScheduleParam &&
    (allowedScheduleIds.includes(scheduleId) || canViewManagerSenior);
  const selectedScheduleId = hasScheduleAccess ? scheduleId : "";
  const attendanceScheduleIds = hasScheduleAccess ? [scheduleId] : undefined;

  const {
    data: enrollments,
    isLoading: enrollmentsLoading,
    isFetching: enrollmentsFetching,
    isError: enrollmentsError,
    refetch: refetchEnrollments,
  } = useGetQuery(
    attendanceStudentsQueryKey(selectedScheduleId),
    () =>
      studentEnrollmentAPI.getStudentEnrollmentsByClassScheduleId(
        selectedScheduleId,
      ),
    {
      enabled: !!selectedScheduleId,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
    },
  );

  const currentDate = getAttendanceSessionDate();
  const attendanceQueryKey = useMemo(
    () => attendanceRecordsQueryKey(currentDate, selectedScheduleId),
    [currentDate, selectedScheduleId],
  );

  const {
    data,
    isLoading: attendanceLoading,
    isFetching: attendanceFetching,
    isError: attendanceError,
    refetch: refetchAttendance,
  } = useGetQuery(
    attendanceQueryKey,
    () =>
      studentAttendanceAPI.filter({
        sessionDate: currentDate,
        scheduleIds: attendanceScheduleIds,
      }),
    {
      enabled: !!attendanceScheduleIds,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
    },
  );

  const refreshAttendanceCheckin = useCallback(async () => {
    if (!hasScheduleAccess) {
      return;
    }

    await Promise.all([refetchEnrollments(), refetchAttendance()]);
  }, [hasScheduleAccess, refetchAttendance, refetchEnrollments]);
  useRegisterPullToRefresh(
    hasScheduleAccess ? refreshAttendanceCheckin : null,
  );

  const { mutate: updateAttendance } = usePlainMutation(
    ({
      attendanceId,
      data: updateData,
    }: {
      attendanceId: string;
      data: AttendanceUpdateStatusRequest;
    }) => studentAttendanceAPI.updateStatus(attendanceId, updateData),
  );
  const { mutate: updateEvaluation } = usePlainMutation(
    ({
      attendanceId,
      data: updateData,
    }: {
      attendanceId: string;
      data: AttendanceUpdateEvaluationRequest;
    }) => studentAttendanceAPI.updateEvaluation(attendanceId, updateData),
  );

  // console.log("Attendance data:", data);

  // Merge server data once, then apply local mutations on top
  const baseMerged = useMemo<StudentAttendanceWithBelt[]>(() => {
    if (!data || !enrollments) return [];
    const beltByStudentId = new Map<string, Belt | null>(
      enrollments.enrollments.map((enrollment) => [
        enrollment.studentSummary.userId,
        readBelt(enrollment.studentSummary),
      ]),
    );

    return mergeAttendanceData(
      enrollments.enrollments,
      data.attendances.content,
      CLASS_SESSION.date,
    ).map((student) => ({
      ...student,
      belt: readBelt(student) ?? beltByStudentId.get(student.studentId) ?? null,
    }));
  }, [data, enrollments]);

  // Stable refs so callbacks don't become stale or recreate on every render
  const baseMergedRef = useRef<StudentAttendanceResponse[]>([]);
  const mutationsRef = useRef<
    Record<string, Partial<StudentAttendanceResponse>>
  >({});

  useEffect(() => {
    baseMergedRef.current = baseMerged;
  }, [baseMerged]);

  useEffect(() => {
    mutationsRef.current = mutations;
  }, [mutations]);

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current !== null) {
        window.clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const students = useMemo<StudentAttendanceWithBelt[]>(
    () => baseMerged.map((s) => ({ ...s, ...(mutations[s.studentId] ?? {}) })),
    [baseMerged, mutations],
  );

  const beltOptions = useMemo(() => {
    const counts = new Map<BeltOptionKey, number>();

    for (const student of students) {
      const belt: BeltOptionKey = student.belt ?? "unknown";
      counts.set(belt, (counts.get(belt) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([belt, count]) => ({
        belt,
        count,
        label: belt === "unknown" ? "Chưa rõ" : BeltLabel[belt],
      }))
      .sort(
        (a, b) =>
          getBeltRank(a.belt === "unknown" ? null : a.belt) -
          getBeltRank(b.belt === "unknown" ? null : b.belt),
      );
  }, [students]);

  const {
    presentCount,
    absentCount,
    excusedCount,
    unmarkedCount,
    totalCount,
    markedCount,
    evalCount,
    evaluableCount,
    evaluationPendingCount,
    progress,
    filtered,
  } = useMemo(() => {
    const present = students.filter(
      (s) => s.attendanceStatus === "PRESENT",
    ).length;
    const absent = students.filter(
      (s) => s.attendanceStatus === "ABSENT",
    ).length;
    const late: number = students.filter(
      (s) => s.attendanceStatus === "LATE",
    ).length;
    const makeup: number = students.filter(
      (s) => s.attendanceStatus === "MAKEUP",
    ).length;
    const excused = students.filter(
      (s) => s.attendanceStatus === "EXCUSED",
    ).length;
    const attendanceMarked = present + absent + late + makeup + excused;
    const attendancePending = students.filter((s) => !s.attendanceStatus).length;
    const evaluableStudents = students.filter((s) =>
      canEvaluateAttendance(s.attendanceStatus),
    );
    const evaluated = evaluableStudents.filter(
      (s) => s.evaluationStatus !== null && s.evaluationStatus !== "PENDING",
    ).length;
    const evaluationPending = evaluableStudents.length - evaluated;
    const total = students.length;

    return {
      presentCount: present,
      absentCount: absent,
      excusedCount: excused,
      unmarkedCount: attendancePending,
      totalCount: total,
      markedCount: attendanceMarked,
      evalCount: evaluated,
      evaluableCount: evaluableStudents.length,
      evaluationPendingCount: evaluationPending,
      lateCount: late,
      makeupCount: makeup,
      progress:
        total > 0
          ? Math.round((attendanceMarked / total) * 100)
          : 0,
      filtered: students
        .filter((s) => filter === "all" || s.attendanceStatus === filter)
        .filter((s) =>
          beltFilter === "all"
            ? true
            : beltFilter === "unknown"
              ? !s.belt
              : s.belt === beltFilter,
        )
        .sort((a, b) => {
          const beltCompare = getBeltRank(a.belt) - getBeltRank(b.belt);
          const orderedBeltCompare =
            beltSort === "asc" ? beltCompare : -beltCompare;

          if (orderedBeltCompare !== 0) return orderedBeltCompare;
          return a.studentName.localeCompare(b.studentName, "vi");
        }),
    };
  }, [students, filter, beltFilter, beltSort]);

  const updateStatus = useCallback(
    (id: string, status: AttendanceStatus | null) => {
      const prevMutation = mutationsRef.current[id];
      const shouldClearEvaluation = !canEvaluateAttendance(status);

      setMutations((prev) => {
        const nextMutation: Partial<StudentAttendanceResponse> = {
          ...prev[id],
          attendanceStatus: status,
          checkInTime: shouldSetCheckInTime(status) ? new Date() : null,
        };

        if (shouldClearEvaluation) {
          nextMutation.evaluationStatus = null;
          nextMutation.evaluatedByCoachName = null;
          nextMutation.note = null;
        }

        return {
          ...prev,
          [id]: nextMutation,
        };
      });

      if (!status) return;

      const attendanceId = baseMergedRef.current.find(
        (s) => s.studentId === id,
      )?.attendanceId;
      if (!attendanceId) return;

      updateAttendance(
        { attendanceId, data: { attendanceStatus: status } },
        {
          // Nếu thành công (Tùy chọn: có thể để trống vì UI đã update rồi)
          onSuccess: (updatedAttendance) => {
            setMutations((prev) => ({
              ...prev,
              [id]: {
                ...prev[id],
                ...updatedAttendance,
              },
            }));
            queryClient.setQueryData<AttendanceListResponse>(
              attendanceQueryKey,
              (old) => mergeAttendanceIntoList(old, updatedAttendance),
            );
            // console.log(`Đã cập nhật trạng thái cho ${id}`);
          },
          // Nếu lỗi -> Thực hiện Rollback (Quay xe)
          onError: () => {
            // Ghi đè lại state cũ
            setMutations((prev) => ({ ...prev, [id]: prevMutation ?? {} }));
          },
        },
      );
    },
    [attendanceQueryKey, queryClient, updateAttendance],
  );

  const updateEval = useCallback(
    (id: string, evalStatus: EvaluationStatus, notes?: string) => {
      const prevMutation = mutationsRef.current[id];

      // 1. Cập nhật giao diện (Nếu có notes thì ghi đè, không thì giữ nguyên)
      setMutations((prev) => {
        const updatedItem = { ...prev[id], evaluationStatus: evalStatus };
        if (notes !== undefined) {
          updatedItem.note = notes;
        }
        return { ...prev, [id]: updatedItem };
      });

      // 2. Tìm attendanceId
      const attendanceId = baseMergedRef.current.find(
        (s) => s.studentId === id,
      )?.attendanceId;
      if (!attendanceId) return;

      // 3. Chuẩn bị dữ liệu gửi lên API
      const payloadData: AttendanceUpdateEvaluationRequest = {
        evaluationStatus: evalStatus ?? undefined,
      };
      if (notes !== undefined) {
        payloadData.note = notes;
      }

      // 4. Gọi API cập nhật đánh giá
      updateEvaluation(
        { attendanceId, data: payloadData },
        {
          onError: () => {
            // Quay xe nếu lỗi
            setMutations((prev) => ({ ...prev, [id]: prevMutation ?? {} }));
          },
        },
      );
    },
    [updateEvaluation],
  );

  const handleSubmit = useCallback(() => {
    setSubmittedTime(nowTime());
    setShowSuccess(true);
  }, []);

  const cancelSubmit = useCallback(() => {
    if (submitTimeoutRef.current !== null) {
      window.clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }

    setIsSubmitPending(false);
    setIsSubmitModalOpen(false);
  }, []);

  const confirmSubmit = useCallback(() => {
    if (isSubmitPending) {
      return;
    }

    setIsSubmitPending(true);

    submitTimeoutRef.current = window.setTimeout(() => {
      handleSubmit();
      setIsSubmitPending(false);
      setIsSubmitModalOpen(false);
      submitTimeoutRef.current = null;
    }, 900);
  }, [handleSubmit, isSubmitPending]);

  if (!hasScheduleAccess) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <Users
            size={40}
            style={{ color: "#E5E7EB", margin: "0 auto 10px" }}
          />
          <p className={styles.emptyText}>
            Bạn không có quyền truy cập lớp này
          </p>
        </div>
      </div>
    );
  }

  const hasData = Boolean(enrollments && data);
  const isInitialLoading = !hasData && (enrollmentsLoading || attendanceLoading);
  const isInitialError = !hasData && (enrollmentsError || attendanceError);
  const isRefreshing = hasData && (enrollmentsFetching || attendanceFetching);
  const displaySession =
    enrollments?.classScheduleSummary ?? routeState?.classScheduleSummary;
  const retryLoad = () => {
    void refetchEnrollments();
    void refetchAttendance();
  };

  return (
    <div className={`${styles.page} ${isPWA ? styles.pagePwa : ""}`}>
      <div className={styles.grid}>
        {/* -- Left Sidebar -- */}
        <RenderProfiler id="AttendanceCheckin:Sidebar" thresholdMs={6}>
          <aside className={styles.sidebar}>
            {displaySession ? (
              <AttendanceHeader
                session={displaySession}
                markedCount={markedCount}
                totalCount={totalCount}
                progress={progress}
                presentCount={presentCount}
                absentCount={absentCount}
                excusedCount={excusedCount}
                unmarkedCount={unmarkedCount}
                evalCount={evalCount}
                filter={filter}
                onFilterChange={setFilter}
                beltFilter={beltFilter}
                beltOptions={beltOptions}
                beltSort={beltSort}
                compact={isPWA}
                onBeltFilterChange={setBeltFilter}
                onBeltSortChange={() =>
                  setBeltSort((current) =>
                    current === "asc" ? "desc" : "asc",
                  )
                }
              />
            ) : (
              <AttendanceHeaderSkeleton />
            )}
          </aside>
        </RenderProfiler>

        {/* -- Right Main -- */}
        <main className={styles.main}>
          {isRefreshing && (
            <div className={styles.refreshNotice} role="status">
              Đang cập nhật dữ liệu mới...
            </div>
          )}
          {/* Student Grid */}
          <RenderProfiler id="AttendanceCheckin:StudentList" thresholdMs={10}>
            <div className={styles.studentList}>
              {isInitialLoading && <StudentListSkeleton />}

              {isInitialError && <ErrorState onRetry={retryLoad} />}

              {hasData && filtered.length === 0 && (
                <div className={styles.emptyState}>
                  <Users
                    size={40}
                    style={{ color: "#E5E7EB", margin: "0 auto 10px" }}
                  />
                  <p className={styles.emptyText}>Không có học viên nào</p>
                </div>
              )}

              {hasData && (
                <AnimatePresence initial={false}>
                  {filtered.map((student, index) => (
                    <StudentCard
                      key={student.studentId}
                      student={student}
                      index={index}
                      onUpdateStatus={updateStatus}
                      onUpdateEval={updateEval}
                      onOpenEval={setEvalTarget}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </RenderProfiler>

          {/* Submit Bar */}
          <RenderProfiler id="AttendanceCheckin:BottomBar" thresholdMs={4}>
            <BottomBar
              unmarkedCount={evaluationPendingCount}
              evalCount={evaluableCount}
            />
          </RenderProfiler>
        </main>
      </div>

      <ConfirmModal
        open={isSubmitModalOpen}
        title="Bạn có muốn nộp điểm danh?"
        description={
          unmarkedCount > 0
            ? `Còn ${unmarkedCount} học viên chưa điểm danh. Bạn vẫn có thể nộp và cập nhật lại sau.`
            : "Tất cả học viên đã được điểm danh. Xác nhận để hoàn tất buổi học."
        }
        cancelText="Hủy"
        confirmText="Có, nộp ngay"
        loadingText="Đang nộp..."
        isLoading={isSubmitPending}
        successToastMessage="Nộp điểm danh thành công"
        errorToastMessage="Nộp điểm danh thất bại. Vui lòng thử lại."
        onCancel={cancelSubmit}
        onConfirm={confirmSubmit}
      />

      {/* -- Eval Sheet -- */}
      <AnimatePresence>
        {evalTarget && (
          <EvalSheet
            student={evalTarget}
            sessionDate={new Date().toISOString().split("T")[0]}
            onSave={(evalStatus, notes) =>
              updateEval(evalTarget.studentId, evalStatus, notes)
            }
            onClose={() => setEvalTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* -- Success Overlay -- */}
      <AnimatePresence>
        {showSuccess && displaySession && (
          <SuccessOverlay
            onClose={() => setShowSuccess(false)}
            present={presentCount}
            absent={absentCount}
            excused={excusedCount}
            className={displaySession.branchName}
            submittedTime={submittedTime}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
