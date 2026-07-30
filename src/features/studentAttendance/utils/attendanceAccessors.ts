import {
  ScheduleShiftLabel,
  WeekdayCodeToLabel,
} from "@/config/constants";
import type { StudentAttendanceResponse } from "@/types";

export function getAttendanceStudentId(row: StudentAttendanceResponse) {
  return row.student.personId;
}

export function getAttendanceStudentName(row: StudentAttendanceResponse) {
  return row.student.fullName;
}

export function getAttendanceStudentCode(row: StudentAttendanceResponse) {
  return row.student.code;
}

export function getAttendanceScheduleId(row: StudentAttendanceResponse) {
  return row.classSchedule.scheduleId;
}

export function getAttendanceBranchName(row: StudentAttendanceResponse) {
  return row.classSchedule.branchName;
}

export function getAttendanceWeekdayLabel(row: StudentAttendanceResponse) {
  return WeekdayCodeToLabel[row.classSchedule.weekday] ?? "-";
}

export function getAttendanceShiftLabel(row: StudentAttendanceResponse) {
  return ScheduleShiftLabel[row.classSchedule.scheduleShift] ?? "-";
}
