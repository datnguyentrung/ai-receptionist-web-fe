import type { SessionStatus } from "@/config/constants/OperationEnums";
import type { ClassScheduleSummary } from "../Core/ClassScheduleTypes";

export interface SessionCreateRequest {
  sessionDate?: string | Date;
  scheduleId: string;
  status?: SessionStatus;
  isAttendanceClosed?: boolean;

  startTime?: string;
  endTime?: string;

  note?: string;
}

export interface SessionUpdateRequest {
  sessionDate?: string | Date;

  status?: SessionStatus;
  isAttendanceClosed?: boolean;
  startTime?: string;
  endTime?: string;
  note?: string;
}

export interface SessionResponse {
  sessionId: string;
  sessionDate?: string | Date;

  classSchedule: ClassScheduleSummary;
  status?: SessionStatus;
  isAttendanceClosed?: boolean;
  startTime?: string;
  endTime?: string;
  note?: string;
}

export interface SessionFilterParams {
  search?: string;
  sessionDate?: string | Date;
  isAttendanceClosed?: boolean;

  scheduleIds?: string[];

  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}
