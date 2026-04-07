import type { AttendanceStatus, EvaluationStatus } from '../../config/constants';
import type { UserResponse } from '../index';
export interface AttendanceRecord extends UserResponse {
  audio_base64?: string;
}

export interface StudentAttendanceResponse {
  attendanceId: string | null;
  enrollmentId: string;
  studentId: string;
  studentName: string;
  classScheduleId?: string;
  /** Format: "yyyy-MM-dd" */
  sessionDate: string;
  attendanceStatus: AttendanceStatus | null;
  /** Format: ISO 8601 UTC */
  checkInTime: Date | string | null;
  recordedByCoachName: string | null;
  evaluationStatus: EvaluationStatus | null;
  note: string | null;
  evaluatedByCoachName: string | null;
  /** Format: ISO 8601 UTC */
  updatedAt: string;
}

export interface StudentAttendanceSimpleResponse {
  attendanceId: string;
  enrollmentId: string;
  studentId: string;
  attendanceStatus: AttendanceStatus;
  /** Format: ISO 8601 UTC */
  checkInTime: string | null;
  recordedByCoachName: string | null;
  evaluationStatus: EvaluationStatus | null;
  evaluatedByCoachName: string | null;
  note: string | null;
}

// ============================================================
// Request DTOs
// ============================================================

/** Tạo danh sách điểm danh cho cả buổi học */
export interface AttendanceBatchCreateRequest {
  classScheduleId: string;
  /** Format: "yyyy-MM-dd" */
  sessionDate: string;
}

/** Điểm danh thủ công / ghi nhận xin nghỉ cho 1 học viên */
export interface AttendanceManualLogRequest {
  studentId: string;
  classScheduleId: string;
  /** Format: "yyyy-MM-dd" */
  sessionDate: string;
  attendanceStatus: AttendanceStatus;
  /** Format: ISO 8601 UTC — null nếu EXCUSED/ABSENT */
  checkInTime?: string | null;
  note?: string;
}

/** Cập nhật trạng thái điểm danh của 1 học viên */
export interface AttendanceUpdateStatusRequest {
  attendanceStatus: AttendanceStatus;
}

/** Cập nhật đánh giá / nhận xét */
export interface AttendanceUpdateEvaluationRequest {
  evaluationStatus?: EvaluationStatus;
  note?: string;
}

/** Cập nhật cả điểm danh lẫn đánh giá cùng lúc */
export interface AttendanceFullUpdateRequest {
  attendanceStatus?: AttendanceStatus;
  evaluationStatus?: EvaluationStatus;
  note?: string;
}
