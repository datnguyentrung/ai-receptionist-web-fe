import type { Belt, CoachStatus } from "../../config/constants";
import type { CoachAssignmentCreateRequest, CoachAssignmentSimpleResponse } from '../Operation/CoachAssignmentTypes';
import type { UserDetail } from '../Security/authTypes';

export interface CoachCreateRequest {
  coachStatus?: CoachStatus;
  fullName: string;
  phoneNumber: string;
  /** Format: "yyyy-MM-dd" */
  birthDate: string;
  belt: Belt;
  roleCode: string; // e.g., "COACH_TRAINEE", "HEAD_COACH"
  email: string;

  assignmentRequest: CoachAssignmentCreateRequest;
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
export interface CoachDetail extends UserDetail {
  /** Format: "yyyy-MM-dd" */
  email: string;

  staffCode: string;
  /** Trạng thái công việc */
  coachStatus: CoachStatus;

  currentAssignments: CoachAssignmentSimpleResponse[];
}

/** Tóm tắt HLV dùng trong danh sách / dropdown */
export interface CoachSummary {
  userId: string;
  fullName: string;
  staffCode: string;
  email: string;
}
