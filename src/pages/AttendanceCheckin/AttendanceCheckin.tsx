import ConfirmModal from "@/components/ConfirmModal";
import { RenderProfiler } from "@/components/dev/RenderProfiler";
import { Skeleton } from "@/components/ui/skeleton";
import type { AttendanceStatus, EvaluationStatus } from "@/config/constants";
import { CLASS_SESSION } from "@/data/mockData";
import {
  EvalSheet,
  useFilterAttendance,
  useUpdateAttendanceEvaluation,
  useUpdateAttendanceStatus,
} from "@/features/studentAttendance";
import { useGetStudentEnrollmentsByClassScheduleId } from "@/features/studentEnrollment";
import { useAuthStore } from "@/store/authStore";
import type {
  AttendanceUpdateEvaluationRequest,
  StudentAttendanceResponse,
} from "@/types";
import { formatDateYMD } from "@/utils/format";
import { mergeAttendanceData } from "@/utils/mergeAttendanceData";
import { useRoleStudent } from "@/utils/roleUtils";
import { Users } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./AttendanceCheckin.module.scss";
import { AttendanceHeader } from "./components/AttendanceHeader";
import { BottomBar } from "./components/BottomBar";
import { StudentCard } from "./components/StudentCard";
import { SuccessOverlay } from "./components/SuccessOverlay";

function nowTime() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// -- Main component ---------------------------------------------
export function AttendanceCheckin() {
  // Local edits (attendanceStatus, evaluationStatus, note, checkInTime) keyed by studentId
  const [mutations, setMutations] = useState<
    Record<string, Partial<StudentAttendanceResponse>>
  >({});
  const [evalTarget, setEvalTarget] =
    useState<StudentAttendanceResponse | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedTime, setSubmittedTime] = useState("");
  const [filter, setFilter] = useState<"all" | AttendanceStatus>("all");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitPending, setIsSubmitPending] = useState(false);
  const submitTimeoutRef = useRef<number | null>(null);

  const { canViewManagerSenior } = useRoleStudent();

  const { scheduleId } = useParams();
  const user = useAuthStore((state) => state.user);
  const allowedScheduleIds =
    user?.userInfo.assignedClasses.map((c) => c.classSchedule.scheduleId) ?? [];
  const hasScheduleParam = !!scheduleId;
  const hasScheduleAccess =
    hasScheduleParam &&
    (allowedScheduleIds.includes(scheduleId) || canViewManagerSenior);
  const selectedScheduleId = hasScheduleAccess ? scheduleId : "";
  const attendanceScheduleIds = hasScheduleAccess ? [scheduleId] : undefined;

  const { data: enrollments, isLoading: enrollmentsLoading } =
    useGetStudentEnrollmentsByClassScheduleId(selectedScheduleId);

  // console.log("Enrollments:", enrollments);

  const { data: data, isLoading: attendanceLoading } = useFilterAttendance(
    undefined,
    formatDateYMD(new Date()),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    attendanceScheduleIds,
  );

  const { mutate: updateAttendance } = useUpdateAttendanceStatus();
  const { mutate: updateEvaluation } = useUpdateAttendanceEvaluation();

  // console.log("Attendance data:", data);

  // Merge server data once, then apply local mutations on top
  const baseMerged = useMemo<StudentAttendanceResponse[]>(() => {
    if (!data || !enrollments) return [];
    return mergeAttendanceData(
      enrollments.enrollments,
      data.attendances.content,
      CLASS_SESSION.date,
    );
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

  const students = useMemo(
    () => baseMerged.map((s) => ({ ...s, ...(mutations[s.studentId] ?? {}) })),
    [baseMerged, mutations],
  );

  const {
    presentCount,
    absentCount,
    excusedCount,
    unmarkedCount,
    totalCount,
    markedCount,
    evalCount,
    progress,
    filtered,
  } = useMemo(() => {
    const present = students.filter(
      (s) => s.attendanceStatus === "PRESENT",
    ).length;
    const absent = students.filter(
      (s) => s.attendanceStatus === "ABSENT",
    ).length;
    const excused = students.filter(
      (s) => s.attendanceStatus === "EXCUSED",
    ).length;
    const unmarked = students.filter((s) => s.attendanceStatus === null).length;
    const total = students.length;
    const marked = total - unmarked;
    const evaluated = students.filter(
      (s) => s.evaluationStatus !== null,
    ).length;

    return {
      presentCount: present,
      absentCount: absent,
      excusedCount: excused,
      unmarkedCount: unmarked,
      totalCount: total,
      markedCount: marked,
      evalCount: evaluated,
      progress: total > 0 ? Math.round((marked / total) * 100) : 0,
      filtered:
        filter === "all"
          ? students
          : students.filter((s) => s.attendanceStatus === filter),
    };
  }, [students, filter]);

  const updateStatus = useCallback(
    (id: string, status: AttendanceStatus | null) => {
      const prevMutation = mutationsRef.current[id];

      setMutations((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          attendanceStatus: status,
          checkInTime:
            status === "PRESENT" || status === "LATE" ? new Date() : null,
        },
      }));

      if (!status) return;

      const attendanceId = baseMergedRef.current.find(
        (s) => s.studentId === id,
      )?.attendanceId;
      if (!attendanceId) return;

      updateAttendance(
        { attendanceId, data: { attendanceStatus: status } },
        {
          // Nếu thành công (Tùy chọn: có thể để trống vì UI đã update rồi)
          onSuccess: () => {
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
    [updateAttendance],
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

  const markAll = useCallback(
    (status: AttendanceStatus | null) => {
      const time = status === "PRESENT" ? nowTime() : null;
      setMutations(
        baseMerged.reduce(
          (acc, s) => ({
            ...acc,
            [s.studentId]: { attendanceStatus: status, checkInTime: time },
          }),
          {} as Record<string, Partial<StudentAttendanceResponse>>,
        ),
      );
    },
    [baseMerged],
  );

  const handleSubmit = useCallback(() => {
    setSubmittedTime(nowTime());
    setShowSuccess(true);
    setSubmitted(true);
  }, []);

  const openSubmitModal = useCallback(() => {
    if (!submitted) {
      setIsSubmitModalOpen(true);
    }
  }, [submitted]);

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

  const handleReset = useCallback(() => markAll(null), [markAll]);

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

  const isLoading = enrollmentsLoading || attendanceLoading;

  if (isLoading || !enrollments || !data) {
    return (
      <div className={styles.page}>
        <div className={styles.grid}>
          {/* Sidebar skeleton */}
          <aside className={styles.sidebar}>
            <div className={styles.skeletonSidebar}>
              <Skeleton className={styles.skeletonTitle} />
              <Skeleton className={styles.skeletonSubtitle} />
              <Skeleton className={styles.skeletonProgress} />
              <div className={styles.skeletonStatRow}>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className={styles.skeletonStat} />
                ))}
              </div>
              <Skeleton className={styles.skeletonFilterBar} />
            </div>
          </aside>

          {/* Cards skeleton */}
          <main className={styles.main}>
            <div className={styles.studentList}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonCardRow}>
                    <Skeleton className={styles.skeletonAvatar} />
                    <div className={styles.skeletonCardInfo}>
                      <Skeleton className={styles.skeletonName} />
                      <Skeleton className={styles.skeletonMeta} />
                    </div>
                  </div>
                  <div className={styles.skeletonPills}>
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className={styles.skeletonPill} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {/* -- Left Sidebar -- */}
        <RenderProfiler id="AttendanceCheckin:Sidebar" thresholdMs={6}>
          <aside className={styles.sidebar}>
            <AttendanceHeader
              session={enrollments.classScheduleSummary}
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
              onMarkAll={markAll}
              onReset={handleReset}
            />
          </aside>
        </RenderProfiler>

        {/* -- Right Main -- */}
        <main className={styles.main}>
          {/* Student Grid */}
          <RenderProfiler id="AttendanceCheckin:StudentList" thresholdMs={10}>
            <div className={styles.studentList}>
              {filtered.length === 0 && (
                <div className={styles.emptyState}>
                  <Users
                    size={40}
                    style={{ color: "#E5E7EB", margin: "0 auto 10px" }}
                  />
                  <p className={styles.emptyText}>Không có học viên nào</p>
                </div>
              )}

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
            </div>
          </RenderProfiler>

          {/* Submit Bar */}
          <RenderProfiler id="AttendanceCheckin:BottomBar" thresholdMs={4}>
            <BottomBar
              unmarkedCount={unmarkedCount}
              markedCount={markedCount}
              totalCount={totalCount}
              submitted={submitted}
              onSubmit={openSubmitModal}
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
        {showSuccess && (
          <SuccessOverlay
            onClose={() => setShowSuccess(false)}
            present={presentCount}
            absent={absentCount}
            excused={excusedCount}
            className={enrollments.classScheduleSummary.branchName}
            submittedTime={submittedTime}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
