import {
  AttendanceStatusLabel,
  CoachTimesheetStatusLabel,
} from "@/config/constants";
import type {
  CoachTimesheetResponse,
  StudentAttendanceResponse,
} from "@/types";

const MISSING_DATA = "Chưa có dữ liệu";

export interface PwaCheckInDisplayDetail {
  label: string;
  value: string;
}

export interface PwaCheckInDisplayResult {
  title: string;
  name?: string;
  details?: PwaCheckInDisplayDetail[];
  note?: string | null;
}

function formatScanDate(value?: string | Date | null) {
  if (!value) return MISSING_DATA;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatScanTime(value?: string | Date | null) {
  if (!value) return MISSING_DATA;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function mapAttendanceToDisplayResult(
  attendance: StudentAttendanceResponse,
): PwaCheckInDisplayResult {
  return {
    title: "Điểm danh thành công",
    name: attendance.studentName,
    details: [
      { label: "Lớp", value: attendance.classScheduleId ?? MISSING_DATA },
      { label: "Ngày học", value: formatScanDate(attendance.sessionDate) },
      {
        label: "Giờ điểm danh",
        value: formatScanTime(attendance.checkInTime),
      },
      {
        label: "Trạng thái",
        value: attendance.attendanceStatus
          ? (AttendanceStatusLabel[attendance.attendanceStatus] ??
            attendance.attendanceStatus)
          : MISSING_DATA,
      },
    ],
    note: attendance.note,
  };
}

export function mapCoachToDisplayResult(
  timesheet: CoachTimesheetResponse,
): PwaCheckInDisplayResult {
  return {
    title: "Chấm công HLV thành công",
    name: timesheet.coach?.fullName ?? "Huấn luyện viên",
    details: [
      {
        label: "Lớp",
        value: timesheet.classSchedule?.scheduleId ?? MISSING_DATA,
      },
      {
        label: "Ngày làm việc",
        value: formatScanDate(timesheet.workingDate),
      },
      { label: "Giờ check-in", value: formatScanTime(timesheet.checkInTime) },
      {
        label: "Trạng thái",
        value:
          CoachTimesheetStatusLabel[timesheet.status] ?? timesheet.status ?? MISSING_DATA,
      },
    ],
    note: timesheet.note,
  };
}
