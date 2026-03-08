import type { StudentEnrollmentStatus } from "../../config/constants";
import type { ClassScheduleSummary } from "../Core/ClassScheduleTypes";
import type { StudentSummary } from "../Core/StudentTypes";

export interface StudentEnrollmentCreateRequest {
  studentId: string;
  scheduleIds: string[];
  /** Format: "yyyy-MM-dd" */
  joinDate: string;
  note?: string;
}

export interface StudentEnrollmentUpdateRequest {
  status: StudentEnrollmentStatus;
  /** Format: "yyyy-MM-dd" — null nếu quay lại ACTIVE */
  leaveDate?: string | null;
  /** Format: "yyyy-MM-dd" */
  joinDate?: string;
  note?: string;
}

// ============================================================
// Response DTOs
// ============================================================

export interface StudentEnrollmentResponse {
  enrollmentId: string;
  student: StudentSummary;
  classSchedule: ClassScheduleSummary;
  /** Format: "yyyy-MM-dd" */
  joinDate: string;
  /** Format: "yyyy-MM-dd" */
  leaveDate: string | null;
  status: StudentEnrollmentStatus;
  note: string | null;
  /** Format: ISO 8601 UTC */
  createdAt: string;
  updatedAt: string;
}

export interface StudentEnrollmentSimpleResponse {
  enrollmentId: string;
  studentSummary: StudentSummary;
  classScheduleSummary: ClassScheduleSummary;
  /** Format: "yyyy-MM-dd" */
  joinDate: string;
  status: StudentEnrollmentStatus;
}

export interface EnrollmentsByScheduleResponse {
  classScheduleSummary: ClassScheduleSummary;
  enrollments: StudentEnrollmentSimpleResponse[];
}

export interface EnrolledStudentItem {
  enrollmentId: string;
  studentSummary: StudentSummary;
  joinDate: string;
  status: StudentEnrollmentStatus;
}
