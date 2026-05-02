export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "EXCUSED"
  | "MAKEUP";

export const AttendanceStatusLabel: Record<AttendanceStatus, string> = {
  PRESENT: "Có mặt",
  ABSENT: "Vắng",
  LATE: "Đi muộn",
  EXCUSED: "Có phép",
  MAKEUP: "Học bù",
};

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

export const EvaluationStatusLabel: Record<EvaluationStatus, string> = {
  PENDING: "Chờ đánh giá",
  GOOD: "Tốt",
  AVERAGE: "Trung bình",
  WEAK: "Yếu",
};

// ---------------------------------------------------------------------------
// StudentEnrollmentStatus
// ---------------------------------------------------------------------------
export type StudentEnrollmentStatus =
  | "ACTIVE" // Đang học
  | "RESERVED" // Bảo lưu
  | "TRANSFERRED" // Chuyển lớp
  | "DROPPED"; // Nghỉ học

export type SessionStatus =
  | "ACTIVE" // Đang diễn ra
  | "CANCELLED" // Đã hủy
  | "COMPLETED" // Đã hoàn thành
  | "SCHEDULED" // Đã lên lịch
  | "POSTPONED" // Đã hoãn
  | "TERMINATED"; // Đã chấm dứt / Hủy bỏ

export const SessionStatusLabel: Record<SessionStatus, string> = {
  ACTIVE: "Đang diễn ra",
  CANCELLED: "Đã hủy",
  COMPLETED: "Đã hoàn thành",
  SCHEDULED: "Đã lên lịch",
  POSTPONED: "Đã hoãn",
  TERMINATED: "Đã chấm dứt",
};

export const ATTENDANCE_POINTS: Record<AttendanceStatus, number> = {
  PRESENT: 5, // Điểm gốc nếu không vi phạm
  MAKEUP: 0.5, // Tập bù
  LATE: -0.5, // Đi học muộn (M)
  EXCUSED: -0.5, // Nghỉ có phép (P)
  ABSENT: -1, // Nghỉ không phép (V)
} as const;

export const PERFORMANCE_POINTS: Record<EvaluationStatus, number> = {
  GOOD: 5, // Tốt (T)
  AVERAGE: 3, // Trung bình (TB)
  WEAK: 0, // Yếu (Y)
  PENDING: 0, // Chờ đánh giá (P) - không tính điểm chuyên môn cho đến khi có đánh giá
};

export type ExamEligibility = "NOT_ELIGIBLE" | "ELIGIBLE" | "EXEMPT" | "NONE" | "PENDING";

export const ExamEligibilityLabel: Record<ExamEligibility, string> = {
  NOT_ELIGIBLE: "Không đủ điều kiện thi thử",
  ELIGIBLE: "Đủ điều kiện thi thử",
  EXEMPT: "⭐ Miễn thi thử",
  NONE: "Không có thông tin",
  PENDING: "Chưa đạt (đang tích lũy)",
};

export type AudioSignal =
  | "CHECKIN_SUCCESS"
  | "ALREADY_CHECKED_IN"
  | "NO_VALID_SESSION"
  | "FACE_NOT_RECOGNIZED";

export const AudioSignalLabel: Record<AudioSignal, string> = {
  CHECKIN_SUCCESS: "Điểm danh thành công",
  ALREADY_CHECKED_IN: "Đã điểm danh",
  NO_VALID_SESSION: "Không có buổi học phù hợp",
  FACE_NOT_RECOGNIZED: "Khuôn mặt không nhận diện được",
};
