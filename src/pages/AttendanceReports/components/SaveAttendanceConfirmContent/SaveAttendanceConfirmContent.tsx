import type {
  AttendanceStatus,
  EvaluationStatus,
} from "@/config/constants/OperationEnums";
import {
  AttendanceStatusLabel,
  EvaluationStatusLabel,
} from "@/config/constants/OperationEnums";
import styles from "./SaveAttendanceConfirmContent.module.scss";

interface SaveAttendanceConfirmContentProps {
  changedCount: number;
  attendanceSummary: Record<AttendanceStatus, number>;
  evaluationSummary: {
    pending: number;
    cleared: number;
    byStatus: Record<EvaluationStatus, number>;
  };
}

export function SaveAttendanceConfirmContent({
  changedCount,
  attendanceSummary,
  evaluationSummary,
}: SaveAttendanceConfirmContentProps) {
  const attendanceOrder: AttendanceStatus[] = [
    "PRESENT",
    "MAKEUP",
    "LATE",
    "EXCUSED",
    "ABSENT",
  ];

  const evaluationOrder: EvaluationStatus[] = [
    "PENDING",
    "GOOD",
    "AVERAGE",
    "WEAK",
  ];

  return (
    <div className={styles.wrapper}>
      <p className={styles.lead}>Sẽ lưu {changedCount} dòng đã chỉnh sửa.</p>

      <div className={styles.block}>
        <p className={styles.blockTitle}>Điểm danh sau cập nhật</p>
        <div className={styles.chips}>
          {attendanceOrder.map((status) => (
            <span key={status} className={styles.chip}>
              {AttendanceStatusLabel[status]}: {attendanceSummary[status]}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.block}>
        <p className={styles.blockTitle}>Đánh giá sau cập nhật</p>
        <div className={styles.chips}>
          {evaluationOrder.map((status) => (
            <span key={status} className={styles.chip}>
              {EvaluationStatusLabel[status]}:{" "}
              {evaluationSummary.byStatus[status]}
            </span>
          ))}
          <span className={styles.chip}>
            Bỏ đánh giá: {evaluationSummary.cleared}
          </span>
          <span className={styles.chip}>
            Tạm pending: {evaluationSummary.pending}
          </span>
        </div>
      </div>
    </div>
  );
}
