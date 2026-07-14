import type { CoachTimesheetStatus } from "../../config/constants";
import type { ClassScheduleSummary } from "../Core/ClassScheduleTypes";
import type { CoachSummary } from "../Core/CoachTypes";
import type { PageResponse } from "../pagination";

export interface CoachTimesheetCheckInRequest {
  staffCode: string;
}

export interface CoachTimesheetAdjustRequest {
  status?: CoachTimesheetStatus;
  /** Format: ISO 8601 UTC */
  checkInTime?: string | null;
  /** Format: ISO 8601 UTC */
  checkOutTime?: string | null;
  note?: string | null;
}

export interface CoachTimesheetResponse {
  timesheetId: string;
  coachAssignmentId: string;
  coach: CoachSummary;
  classSchedule: ClassScheduleSummary;
  /** Format: "yyyy-MM-dd" */
  workingDate: string;
  /** Format: ISO 8601 UTC */
  checkInTime: string | null;
  /** Format: ISO 8601 UTC */
  checkOutTime: string | null;
  status: CoachTimesheetStatus;
  note: string | null;
  /** Format: ISO 8601 UTC */
  createdAt: string;
  /** Format: ISO 8601 UTC */
  updatedAt: string;
}

export interface CoachTimesheetSummaryResponse {
  totalRecords: number;
  totalTeachingSessions: number;
}

export interface CoachTimesheetListResponse {
  summary: CoachTimesheetSummaryResponse;
  timesheets: PageResponse<CoachTimesheetResponse>;
}

export interface CoachTimesheetFilterRequest {
  coachId?: string;
  coachAssignmentId?: string;
  classScheduleId?: string;
  branchId?: number;
  status?: CoachTimesheetStatus;
  /** Format: "yyyy-MM-dd" */
  workDate?: string;
  /** Format: "yyyy-MM-dd" */
  fromDate?: string;
  /** Format: "yyyy-MM-dd" */
  toDate?: string;
  month?: number;
  year?: number;
  search?: string;
}
