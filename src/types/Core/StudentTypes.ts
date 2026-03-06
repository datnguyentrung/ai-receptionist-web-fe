import type { Belt, StudentStatus } from "../../config/constants";
import type { PageResponse } from "../pagination";
import type { ClassScheduleSummary } from "./ClassScheduleTypes";

// Type cho params lọc
export interface GetStudentsParams {
  search?: string;
  status?: StudentStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface StudentListResponse {
  activeStudentCount: number;
  reservedStudentCount: number;
  droppedStudentCount: number;
  students: PageResponse<StudentOverview>;
}

// ============================================================
// Request DTOs
// ============================================================

export interface StudentOverview {
  studentCode: string;
  nationalCode: string | null;
  fullName: string;
  birthDate: string | Date;
  phoneNumber: string;
  belt: Belt;
  roleName: string;
  studentStatus: StudentStatus;
  branchName: string;
  classSchedules: ClassScheduleSummary[];
}

export interface StudentCreateRequest {
  nationalCode?: string;
  studentStatus: StudentStatus;
  fullName: string;
  /** Format: "yyyy-MM-dd" */
  startDate: string;
  branchId: number;
  phoneNumber: string;
  /** Format: "yyyy-MM-dd" */
  birthDate: string;
  belt: Belt;
}

export interface StudentUpdateRequest {
  userId: string;
  phoneNumber?: string;
  /** Format: "yyyy-MM-dd" */
  birthDate?: string;
  belt?: Belt;
  nationalCode?: string;
  fullName?: string;
  /** Format: "yyyy-MM-dd" */
  startDate?: string;
  studentStatus?: StudentStatus;
  branchId?: number;
}

// ============================================================
// Response DTOs
// ============================================================

/** Chi tiết đầy đủ của một học viên */
export interface StudentDetail {
  userId: string;
  /** Format: "yyyy-MM-dd" */
  birthDate: string;
  phoneNumber: string;
  belt: Belt;
  /** Trạng thái tài khoản hệ thống */
  status: string; // UserStatus
  /** Format: ISO 8601 UTC */
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  roleName: string;
  studentCode: string;
  nationalCode: string | null;
  fullName: string;
  /** Format: "yyyy-MM-dd" */
  startDate: string;
  studentStatus: StudentStatus;
  branchId: number;
  branchName: string;
  branchAddress: string;
}

/** Tóm tắt học viên dùng trong danh sách / dropdown */
export interface StudentSummary {
  userId: string;
  fullName: string;
  email: string;
  code: string;
}
