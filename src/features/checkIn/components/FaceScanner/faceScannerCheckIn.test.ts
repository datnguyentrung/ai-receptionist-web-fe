import { describe, expect, it } from "vitest";
import type {
  CoachDetail,
  CoachSummary,
  FaceCheckInResponse,
  StudentDetail,
  StudentAttendanceResponse,
  StudentSummary,
} from "@/types";
import { normalizeFaceCheckInResponse } from "./faceScannerCheckIn";

const studentSummary: StudentSummary = {
  personId: "student-1",
  fullName: "Nguyễn An",
  code: "VQ_001",
  email: "student@example.com",
};

const coachSummary: CoachSummary = {
  personId: "coach-1",
  fullName: "Trần Bình",
  staffCode: "VQT001",
  email: "coach@example.com",
};

const studentDetail = {
  personId: "student-1",
  fullName: "Nguyễn An",
  studentCode: "VQ_001",
  belt: "C10",
  studentStatus: "ACTIVE",
  branchName: "Văn Quán",
} as StudentDetail;

const coachDetail = {
  personId: "coach-1",
  fullName: "Trần Bình",
  staffCode: "VQT001",
  belt: "D2",
  coachStatus: "ACTIVE",
  email: "coach@example.com",
  currentAssignments: [],
} as CoachDetail;

const studentSuccess: FaceCheckInResponse = {
  personType: "STUDENT",
  checkInSuccess: true,
  checkInErrorCode: null,
  checkInErrorMessage: null,
  studentDetail,
  coachDetail: null,
  studentAttendance: {
    attendanceId: "attendance-1",
    enrollmentId: "enrollment-1",
    student: studentSummary,
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
    sessionDate: "2026-07-26",
    attendanceStatus: "PRESENT",
    checkInTime: "2026-07-26T08:00:00Z",
    recordedByCoachName: null,
    evaluationStatus: null,
    note: null,
    evaluatedByCoachName: null,
    updatedAt: "2026-07-26T08:00:00Z",
  } as unknown as StudentAttendanceResponse,
  coachTimesheet: null,
};

const coachSuccess: FaceCheckInResponse = {
  personType: "COACH",
  checkInSuccess: true,
  checkInErrorCode: null,
  checkInErrorMessage: null,
  studentDetail: null,
  coachDetail,
  studentAttendance: null,
  coachTimesheet: {
    timesheetId: "timesheet-1",
    coachAssignmentId: "assignment-1",
    coach: coachSummary,
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
  },
};

describe("normalizeFaceCheckInResponse", () => {
  it("normalizes successful student and coach responses by personType", () => {
    const student = normalizeFaceCheckInResponse(studentSuccess);
    const coach = normalizeFaceCheckInResponse(coachSuccess);

    expect(student.status).toBe(true);
    expect(student.attendance_record).toBe(studentSuccess.studentAttendance);
    expect(student.message).toBe("Điểm danh Nguyễn An thành công.");

    expect(coach.status).toBe(true);
    expect(coach.coachTimesheet).toBe(coachSuccess.coachTimesheet);
    expect(coach.message).toBe("Chấm công HLV Trần Bình thành công.");
  });

  it("preserves a recognized student detail in an HTTP 200 business failure", () => {
    const result = normalizeFaceCheckInResponse({
      ...studentSuccess,
      checkInSuccess: false,
      checkInErrorCode: "STUDENT_INACTIVE",
      checkInErrorMessage: "Học viên không ở trạng thái hoạt động",
      studentAttendance: null,
    });

    expect(result).toMatchObject({
      status: false,
      checkInErrorCode: "STUDENT_INACTIVE",
      recognizedPerson: { personType: "STUDENT", ...studentDetail },
    });
  });

  it("preserves the full coach detail in an HTTP 200 business failure", () => {
    const result = normalizeFaceCheckInResponse({
      ...coachSuccess,
      checkInSuccess: false,
      checkInErrorCode: "CHECK_IN_TOO_LATE",
      checkInErrorMessage: "Đã quá thời gian được phép chấm công",
      coachTimesheet: null,
    });

    expect(result).toMatchObject({
      status: false,
      checkInErrorCode: "CHECK_IN_TOO_LATE",
      message: "Đã quá thời gian được phép chấm công",
      recognizedPerson: { personType: "COACH", ...coachDetail },
    });
  });

  it("rejects inconsistent success and person-detail payloads", () => {
    expect(() =>
      normalizeFaceCheckInResponse({
        ...studentSuccess,
        studentAttendance: null,
      }),
    ).toThrow("missing its successful check-in record");

    expect(() =>
      normalizeFaceCheckInResponse({
        ...studentSuccess,
        coachDetail,
      }),
    ).toThrow("invalid person detail");
  });
});
