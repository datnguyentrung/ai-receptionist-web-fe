import type {
  AttendanceStatus,
  Belt,
  EvaluationStatus,
} from "@/config/constants";
import { BeltLabel } from "@/config/constants";
import { AttendancePill, EvalQuick } from "@/features/studentAttendance";
import type { StudentAttendanceResponse } from "@/types";
import { avatarColor } from "@/utils/avatarColor";
import { getNameInitials } from "@/utils/getInitials";
import { ChevronDown, Clock, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useState } from "react";
import styles from "./StudentCard.module.scss";

// function evalLabel(e: EvaluationStatus | null): string | null {
//   if (!e) return null;
//   return (
//     {
//       GOOD: "👍 Tốt",
//       AVERAGE: "👌 Trung bình",
//       WEAK: "😔 Yếu",
//       PENDING: "⏳ Chờ",
//     }[e] ?? null
//   );
// }

interface StudentCardProps {
  student: StudentAttendanceResponse & { belt?: Belt | null };
  index: number;
  onUpdateStatus: (id: string, status: AttendanceStatus | null) => void;
  onUpdateEval: (id: string, status: EvaluationStatus) => void;
  onOpenEval: (student: StudentAttendanceResponse) => void;
}

export function StudentCardInner({
  student,
  index,
  onUpdateStatus,
  onUpdateEval,
  onOpenEval,
}: StudentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasAttendanceRecord = Boolean(student.attendanceId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18, delay: index * 0.02 }}
      className={`${styles.studentCard} ${
        student.attendanceStatus === "PRESENT"
          ? styles.present
          : student.attendanceStatus === "ABSENT"
            ? styles.absent
            : student.attendanceStatus === "EXCUSED"
              ? styles.excused
              : styles.unmarked
      }`}
    >
      {/* Main row */}
      <div className={styles.studentRow}>
        {/* Avatar */}
        <div className={styles.avatarWrap}>
          <div
            className={styles.avatar}
            style={{ background: avatarColor(student.studentId) }}
          >
            {getNameInitials(student.studentName)}
          </div>
        </div>

        {/* Info */}
        <div className={styles.studentInfo}>
          <div className={styles.nameRow}>
            <p className={styles.studentName}>{student.studentName}</p>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.beltTag}>
              {student.belt ? BeltLabel[student.belt] : "Chưa rõ đai"}
            </span>
            {student.checkInTime && (
              <span className={styles.checkInTime}>
                <Clock size={9} />{" "}
                {new Date(student.checkInTime).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Evaluation moved to the top/main row */}
        <div className={styles.evalInlineWrap}>
          <EvalQuick
            value={student.evaluationStatus}
            canEvaluate={hasAttendanceRecord}
            onChange={(v) => {
              if (v !== student.evaluationStatus) {
                onUpdateEval(student.studentId, v);
              }
            }}
          />
        </div>

        {/* Expand toggle */}
        <button
          type="button"
          disabled={!hasAttendanceRecord}
          onClick={() => setExpanded((prev) => !prev)}
          className={`${styles.expandBtn} ${styles.expandToggleBtn} ${
            expanded ? styles.expanded : ""
          } ${!hasAttendanceRecord ? styles.expandBtnDisabled : ""}`}
          aria-expanded={expanded}
          aria-label={expanded ? "Thu gọn chi tiết" : "Mở chi tiết"}
        >
          <ChevronDown
            size={14}
            className={`${styles.chevron} ${expanded ? styles.rotated : ""}`}
          />
        </button>
      </div>

      {/* Attendance moved to the bottom */}
      <div className={styles.attendanceBottomWrap}>
        <AttendancePill
          attendanceId={student.attendanceId ? student.attendanceId : undefined}
          value={student.attendanceStatus}
          onChange={(v) => onUpdateStatus(student.studentId, v)}
        />
      </div>

      {/* Expanded evaluation area */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.expandedPanel}
          >
            <div className={styles.expandedInner}>
              {/* Student meta */}
              {/* <div className={styles.studentMeta}>
                <p className={styles.metaItem}>
                  Mã HV:{" "}
                  <span className={styles.metaValue}>{student.studentId}</span>
                </p>
                {student.sessionDate && (
                  <p className={styles.metaItem}>
                    Ngày:{" "}
                    <span className={styles.metaValue}>
                      {new Date(student.sessionDate).toLocaleDateString(
                        "vi-VN",
                      )}
                    </span>
                  </p>
                )}
              </div> */}

              {/* Notes preview */}
              {student.note && (
                <div className={styles.notesPreview}>
                  <p className={styles.notesText}>"{student.note}"</p>
                </div>
              )}

              {/* Full evaluation entry remains available from expanded panel */}
              <button
                type="button"
                onClick={() => onOpenEval(student)}
                className={`${styles.evalBtn} ${
                  student.evaluationStatus ? styles.evaluated : ""
                }`}
              >
                <Zap size={14} />
                {student.note ? `Sửa chi tiết` : "Nhận xét nhanh"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export const StudentCard = memo(StudentCardInner, (prev, next) => {
  return (
    prev.index === next.index &&
    prev.student.studentId === next.student.studentId &&
    prev.student.belt === next.student.belt &&
    prev.student.attendanceId === next.student.attendanceId &&
    prev.student.attendanceStatus === next.student.attendanceStatus &&
    prev.student.evaluationStatus === next.student.evaluationStatus &&
    prev.student.checkInTime === next.student.checkInTime &&
    prev.student.note === next.student.note &&
    prev.onUpdateStatus === next.onUpdateStatus &&
    prev.onUpdateEval === next.onUpdateEval &&
    prev.onOpenEval === next.onOpenEval
  );
});
