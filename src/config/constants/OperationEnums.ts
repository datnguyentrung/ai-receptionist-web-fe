export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "EXCUSED"
  | "MAKEUP";

export type BeltPromotionStatus = "PASSED" | "FAILED" | "PENDING";

// ---------------------------------------------------------------------------
// CoachAssignmentStatus
// ---------------------------------------------------------------------------
export type CoachAssignmentStatus =
  | "ACTIVE" // 🟢 Đang giảng dạy
  | "SUSPENDED" // 🟡 Tạm ngưng / Bảo lưu
  | "COMPLETED" // 🔵 Hoàn thành nhiệm vụ
  | "TERMINATED" // 🔴 Chấm dứt / Hủy bỏ
  | "PENDING"; // ⚪ Dự kiến – chờ nhận lớp

export const CoachAssignmentStatusLabel: Record<CoachAssignmentStatus, string> =
  {
    ACTIVE: "Đang giảng dạy",
    SUSPENDED: "Tạm ngưng",
    COMPLETED: "Hoàn thành nhiệm vụ",
    TERMINATED: "Chấm dứt",
    PENDING: "Chờ nhận lớp",
  };

// ---------------------------------------------------------------------------
// CoachTimesheetStatus
// ---------------------------------------------------------------------------
export type CoachTimesheetStatus =
  | "PENDING" // Chờ duyệt
  | "APPROVED" // Đã duyệt
  | "REJECTED"; // Bị từ chối

// ---------------------------------------------------------------------------
// EvaluationStatus
// ---------------------------------------------------------------------------
export type EvaluationStatus =
  | "PENDING" // Chờ đánh giá  → "P"
  | "GOOD" // Tốt            → "T"
  | "AVERAGE" // Trung bình     → "TB"
  | "WEAK"; // Yếu            → "Y"

/** Giá trị rút gọn dùng khi serialize ra JSON (tương đương @JsonValue bên Java) */
export const EvaluationStatusValue: Record<EvaluationStatus, string> = {
  PENDING: "P",
  GOOD: "T",
  AVERAGE: "TB",
  WEAK: "Y",
};

/** Tra cứu EvaluationStatus từ giá trị rút gọn (tương đương fromValue() bên Java) */
export const EvaluationStatusFromValue = Object.entries(
  EvaluationStatusValue,
).reduce(
  (acc, [key, val]) => {
    acc[val] = key as EvaluationStatus;
    return acc;
  },
  {} as Record<string, EvaluationStatus>,
);

// ---------------------------------------------------------------------------
// StudentEnrollmentStatus
// ---------------------------------------------------------------------------
export type StudentEnrollmentStatus =
  | "ACTIVE" // Đang học
  | "RESERVED" // Bảo lưu
  | "TRANSFERRED" // Chuyển lớp
  | "DROPPED"; // Nghỉ học
