import type { AttendanceStatus } from "@/config/constants";

export const NON_EVALUABLE_ATTENDANCE_STATUSES = [
  "ABSENT",
  "EXCUSED",
] as const satisfies readonly AttendanceStatus[];

const NON_EVALUABLE_ATTENDANCE_STATUS_SET: ReadonlySet<AttendanceStatus> =
  new Set(NON_EVALUABLE_ATTENDANCE_STATUSES);

export function canEvaluateAttendance(
  status: AttendanceStatus | null | undefined,
) {
  if (status == null) {
    return false;
  }

  return !NON_EVALUABLE_ATTENDANCE_STATUS_SET.has(status);
}
