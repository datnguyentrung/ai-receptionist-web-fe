import { Skeleton } from "@/components/ui/skeleton";
import type { AttendanceStatus, EvaluationStatus } from "@/config/constants";
import { CLASS_SESSION } from "@/data/mockData";
import { useFilterAttendance } from "@/features/studentAttendance/api/useStudentAttendance";
import { EvalSheet } from "@/features/studentAttendance/components/EvalSheet";
import { useGetStudentEnrollmentsByClassScheduleId } from "@/features/studentEnrollment/api/useStudentEnrollment";
import type { StudentAttendanceResponse } from "@/types";
import { formatDateYMD } from "@/utils/format";
import { mergeAttendanceData } from "@/utils/mergeAttendanceData";
import { Users } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useCallback, useMemo, useState } from "react";
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

  const { scheduleId } = useParams();

  const { data: enrollments, isLoading: enrollmentsLoading } =
    useGetStudentEnrollmentsByClassScheduleId(scheduleId!);

  // console.log("Enrollments:", enrollments);

  const { data: data, isLoading: attendanceLoading } = useFilterAttendance(
    undefined,
    formatDateYMD(new Date()),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    scheduleId,
  );

  // console.log("Attendance data:", data);

  // Merge server data once, then apply local mutations on top
  const baseMerged = useMemo<StudentAttendanceResponse[]>(() => {
    if (!data || !enrollments) return [];
    return mergeAttendanceData(
      enrollments.enrollments,
      data.content,
      CLASS_SESSION.date,
    );
  }, [data, enrollments]);

  const students = useMemo(
    () => baseMerged.map((s) => ({ ...s, ...(mutations[s.studentId] ?? {}) })),
    [baseMerged, mutations],
  );

  // Derived stats
  const presentCount = students.filter(
    (s) => s.attendanceStatus === "PRESENT",
  ).length;
  const absentCount = students.filter(
    (s) => s.attendanceStatus === "ABSENT",
  ).length;
  const excusedCount = students.filter(
    (s) => s.attendanceStatus === "EXCUSED",
  ).length;
  const unmarkedCount = students.filter(
    (s) => s.attendanceStatus === null,
  ).length;
  const totalCount = students.length;
  const markedCount = totalCount - unmarkedCount;
  const evalCount = students.filter((s) => s.evaluationStatus !== null).length;
  const progress = Math.round((markedCount / totalCount) * 100);

  // Filter
  const filtered =
    filter === "all"
      ? students
      : students.filter((s) => s.attendanceStatus === filter);

  const updateStatus = useCallback(
    (id: string, status: AttendanceStatus | null) => {
      setMutations((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          attendanceStatus: status,
          checkInTime: status === "PRESENT" ? nowTime() : null,
        },
      }));
    },
    [],
  );

  const saveEval = useCallback(
    (id: string, evalStatus: EvaluationStatus | null, notes: string) => {
      setMutations((prev) => ({
        ...prev,
        [id]: { ...prev[id], evaluationStatus: evalStatus, note: notes },
      }));
    },
    [],
  );

  const updateEval = useCallback(
    (id: string, evalStatus: EvaluationStatus | null) => {
      setMutations((prev) => ({
        ...prev,
        [id]: { ...prev[id], evaluationStatus: evalStatus },
      }));
    },
    [],
  );

  const markAll = (status: AttendanceStatus | null) => {
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
  };

  const handleSubmit = () => {
    setSubmittedTime(nowTime());
    setShowSuccess(true);
    setSubmitted(true);
  };

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
            onReset={() => markAll(null)}
          />
        </aside>

        {/* -- Right Main -- */}
        <main className={styles.main}>
          {/* Student Grid */}
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

          {/* Submit Bar */}
          <BottomBar
            unmarkedCount={unmarkedCount}
            markedCount={markedCount}
            totalCount={totalCount}
            submitted={submitted}
            onSubmit={handleSubmit}
          />
        </main>
      </div>

      {/* -- Eval Sheet -- */}
      <AnimatePresence>
        {evalTarget && (
          <EvalSheet
            student={evalTarget}
            sessionDate={new Date().toISOString().split("T")[0]}
            onSave={(evalStatus, notes) =>
              saveEval(evalTarget.studentId, evalStatus, notes)
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
