import type { AttendanceStatus, EvaluationStatus } from "@/config/constants";
import { AttendancePill, EvalQuick } from "@/features/studentAttendance";
import type { StudentAttendanceResponse } from "@/types";
import { avatarColor } from "@/utils/avatarColor";
import { getNameInitials } from "@/utils/getInitials";
import { ChevronDown, Clock, Eye, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../../../components/ui/hover-card";
import styles from "./StudentCard.module.scss";

function evalLabel(e: EvaluationStatus | null): string | null {
  if (!e) return null;
  return (
    {
      GOOD: "👍 Tốt",
      AVERAGE: "👌 Trung bình",
      WEAK: "😔 Yếu",
      PENDING: "⏳ Chờ",
    }[e] ?? null
  );
}

interface StudentCardProps {
  student: StudentAttendanceResponse;
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
  const changeAttendance = !student?.attendanceId;

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
            {student.evaluationStatus && (
              <span className={styles.evalBadge}>
                {evalLabel(student.evaluationStatus)}
              </span>
            )}
          </div>
          <div className={styles.metaRow}>
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

        {/* Attendance pill */}
        <div className={styles.pillWrap}>
          <AttendancePill
            attendanceId={
              student.attendanceId ? student.attendanceId : undefined
            }
            value={student.attendanceStatus}
            onChange={(v) => onUpdateStatus(student.studentId, v)}
          />
        </div>

        {/* Nút Eye kèm Popover */}
        {changeAttendance ? (
          <HoverCard openDelay={0} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div className={styles.disabledExpandTriggerWrap}>
                <button
                  disabled
                  className={`${styles.expandBtn} ${styles.expandBtnDisabled}`}
                >
                  <Eye size={14} className={`${styles.chevron}`} />
                </button>
              </div>
            </HoverCardTrigger>

            <HoverCardContent
              side="top"
              align="center"
              className={styles.missingAttendanceHoverCard}
            >
              Học viên này chưa có bản ghi điểm danh hôm nay
            </HoverCardContent>
          </HoverCard>
        ) : (
          <HoverCard openDelay={0} closeDelay={100}>
            <HoverCardTrigger asChild>
              <button className={`${styles.expandBtn}`}>
                <Eye size={14} className={`${styles.chevron}`} />
              </button>
            </HoverCardTrigger>

            {/* Nội dung sẽ hiển thị khi di chuột vào con mắt */}
            <HoverCardContent
              side="top"
              align="center"
              className={styles.evalHoverCard}
            >
              <EvalQuick
                value={student.evaluationStatus}
                onChange={(v) => onUpdateEval(student.studentId, v)}
                studentName={student.studentName}
              />
            </HoverCardContent>
          </HoverCard>
        )}

        {/* Expand toggle */}
        {changeAttendance ? (
          <HoverCard openDelay={0} closeDelay={100}>
            <HoverCardTrigger asChild>
              {/* Phải bọc div vì button disabled bị mất pointer-events, không trigger được hover */}
              <div className={styles.disabledExpandTriggerWrap}>
                <button
                  disabled
                  className={`${styles.expandBtn} ${styles.expandBtnDisabled}`}
                >
                  <ChevronDown size={14} className={styles.chevron} />
                </button>
              </div>
            </HoverCardTrigger>

            <HoverCardContent
              side="top"
              align="center"
              className={styles.missingAttendanceHoverCard}
            >
              Học viên này chưa có bản ghi điểm danh hôm nay
            </HoverCardContent>
          </HoverCard>
        ) : (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className={`${styles.expandBtn} ${expanded ? styles.expanded : ""}`}
          >
            <ChevronDown
              size={14}
              className={`${styles.chevron} ${expanded ? styles.rotated : ""}`}
            />
          </button>
        )}
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
              <div className={styles.studentMeta}>
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
              </div>

              {/* Notes preview */}
              {student.note && (
                <div className={styles.notesPreview}>
                  <p className={styles.notesText}>"{student.note}"</p>
                </div>
              )}

              {/* Quick eval button */}
              <button
                onClick={() => onOpenEval(student)}
                className={`${styles.evalBtn} ${student.evaluationStatus ? styles.evaluated : ""}`}
              >
                <Zap size={14} />
                {student.evaluationStatus
                  ? `Đã nhận xét: ${evalLabel(student.evaluationStatus)} · Sửa`
                  : "Nhận xét nhanh"}
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
    prev.student.attendanceStatus === next.student.attendanceStatus &&
    prev.student.evaluationStatus === next.student.evaluationStatus &&
    prev.student.checkInTime === next.student.checkInTime &&
    prev.student.note === next.student.note &&
    prev.onUpdateStatus === next.onUpdateStatus &&
    prev.onUpdateEval === next.onUpdateEval &&
    prev.onOpenEval === next.onOpenEval
  );
});
