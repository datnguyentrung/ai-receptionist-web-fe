import type { Belt, CoachStatus } from "../../config/constants";

export interface CoachCreateRequest {
  coachStatus?: CoachStatus;
  fullName: string;
  phoneNumber: string;
  /** Format: "yyyy-MM-dd" */
  birthDate: string;
  belt: Belt;
}

export interface CoachUpdateRequest {
  userId: string;
  phoneNumber?: string;
  /** Format: "yyyy-MM-dd" */
  birthDate?: string;
  belt?: Belt;
  nationalCode?: string;
  fullName?: string;
  coachStatus?: CoachStatus;
}

// ============================================================
// Response DTOs
// ============================================================

/** Chi tiết đầy đủ của một HLV */
export interface CoachDetail {
  userId: string;
  /** Format: "yyyy-MM-dd" */
  birthDate: string;
  phoneNumber: string;
  belt: Belt;
  /** Trạng thái tài khoản hệ thống */
  status: string; // UserStatus — imported from Security if needed
  /** Format: ISO 8601 UTC */
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  roleName: string;
  staffCode: string;
  fullName: string;
  /** Trạng thái công việc */
  coachStatus: CoachStatus;
}

/** Tóm tắt HLV dùng trong danh sách / dropdown */
export interface CoachSummary {
  userId: string;
  fullName: string;
  staffCode: string;
}
