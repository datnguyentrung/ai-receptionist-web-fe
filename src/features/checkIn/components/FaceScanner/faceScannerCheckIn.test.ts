import { describe, expect, it } from "vitest";
import type {
  CoachTimesheetResponse,
  StudentAttendanceResponse,
} from "@/types";
import { normalizeFaceCheckInResponse } from "./faceScannerCheckIn";

const attendance: StudentAttendanceResponse = {
  attendanceId: "attendance-1",
  enrollmentId: "enrollment-1",
  studentId: "student-1",
  studentName: "Nguyễn An",
  classScheduleId: "class-1",
  sessionDate: "2026-07-26",
  attendanceStatus: "PRESENT",
  checkInTime: "2026-07-26T08:00:00Z",
  recordedByCoachName: null,
  evaluationStatus: null,
  note: null,
  evaluatedByCoachName: null,
  updatedAt: "2026-07-26T08:00:00Z",
};

const timesheet: CoachTimesheetResponse = {
  timesheetId: "timesheet-1",
  coachAssignmentId: "assignment-1",
  coach: {
    personId: "coach-1",
    fullName: "Trần Bình",
    staffCode: "VQT001",
    email: "coach@example.com",
  },
  classSchedule: {
    scheduleId: "class-1",
    branchName: "Văn Quán",
    scheduleLocation: "INDOOR",
    scheduleLevel: "KID",
    scheduleShift: "CA_1",
    startTime: "08:00",
    endTime: "09:00",
    weekday: 7,
  },
  workingDate: "2026-07-26",
  checkInTime: "2026-07-26T08:00:00Z",
  checkOutTime: null,
  status: "PENDING",
  note: null,
  createdAt: "2026-07-26T08:00:00Z",
  updatedAt: "2026-07-26T08:00:00Z",
};

describe("normalizeFaceCheckInResponse", () => {
  it("normalizes a student attendance response", () => {
    const result = normalizeFaceCheckInResponse(attendance);

    expect(result.attendance_record).toBe(attendance);
    expect(result.coachTimesheet).toBeNull();
    expect(result.message).toBe("Điểm danh Nguyễn An thành công.");
  });

  it("normalizes a coach timesheet response", () => {
    const result = normalizeFaceCheckInResponse(timesheet);

    expect(result.attendance_record).toBeNull();
    expect(result.coachTimesheet).toBe(timesheet);
    expect(result.message).toBe("Chấm công HLV Trần Bình thành công.");
  });
});
