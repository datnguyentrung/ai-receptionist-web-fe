import type {
  ScheduleLevel,
  ScheduleLocation,
  ScheduleShift,
  ScheduleStatus,
  Weekday,
} from "../../config/constants";
import type { CoachSummary } from "./CoachTypes";

/** Dùng trong danh sách / dropdown — thông tin tối giản */
export interface ClassScheduleSummary {
  scheduleId: string;
  branchName: string;
  scheduleLocation: ScheduleLocation;
  scheduleLevel: ScheduleLevel;
  scheduleShift: ScheduleShift;
  /** Format: "HH:mm" */
  startTime: string;
  /** Format: "HH:mm" */
  endTime: string;
  weekday: number;
}

/** Dùng khi xem chi tiết 1 lớp học */
export interface ClassScheduleDetail {
  scheduleId: string;

  branchId: number;
  branchName: string;

  coaches: CoachSummary[];

  scheduleLevel: ScheduleLevel;
  scheduleShift: ScheduleShift;
  scheduleLocation: ScheduleLocation;
  scheduleStatus: ScheduleStatus;

  weekday: number;
  /** Format: "HH:mm" */
  startTime: string;
  /** Format: "HH:mm" */
  endTime: string;

  totalStudents: number | null;
}

export interface ClassScheduleCreateRequest {
  scheduleId: string;

  branchId: number;
  weekday: Weekday;

  scheduleLevel: ScheduleLevel;
  scheduleShift: ScheduleShift;
  scheduleLocation: ScheduleLocation;
  scheduleStatus: ScheduleStatus;

  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
}

export interface ClassScheduleUpdateRequest {
  branchId?: number;
  coachIds?: number[];
  scheduleLevel?: ScheduleLevel;
  scheduleShift?: ScheduleShift;
  scheduleLocation?: ScheduleLocation;
  scheduleStatus?: ScheduleStatus;
  weekday?: Weekday;
  startTime?: string; // Format: "HH:mm"
  endTime?: string; // Format: "HH:mm"
}
