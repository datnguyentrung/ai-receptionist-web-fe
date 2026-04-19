import type { CoachAssignmentStatus } from '../../config/constants';
import type { ClassScheduleSummary } from "../Core/ClassScheduleTypes";
import type { CoachSummary } from "../Core/CoachTypes";

export interface CoachAssignmentCreateRequest {
  coachId: string;
  scheduleIds: string[];
  /** Format: "yyyy-MM-dd" */
  assignmentDate: string;
  /** Format: "yyyy-MM-dd" */
  endDate: string;
  note?: string;
}

export interface CoachAssignmentUpdateRequest {
  status: CoachAssignmentStatus;
  /** Format: "yyyy-MM-dd" */
  assignmentDate?: string;
  /** Format: "yyyy-MM-dd" */
  endDate?: string;
  note?: string;
}

// ============================================================
// Response DTOs
// ============================================================

export interface CoachAssignmentResponse {
  assignmentId: string;
  coach: CoachSummary;
  classSchedule: ClassScheduleSummary;
  /** Format: "yyyy-MM-dd" */
  assignedDate: string;
  /** Format: "yyyy-MM-dd" */
  endDate: string;
  status: CoachAssignmentStatus;
  note: string | null;
  /** Format: ISO 8601 UTC */
  createdAt: string;
  updatedAt: string;
}

export interface CoachAssignmentSimpleResponse {
  assignmentId: string;
  coach: CoachSummary;
  /** Format: "yyyy-MM-dd" */
  assignedDate: string;
  /** Format: "yyyy-MM-dd" */
  endDate: string;
  status: CoachAssignmentStatus;
}
