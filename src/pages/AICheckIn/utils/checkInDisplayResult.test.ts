import type {
  CoachTimesheetResponse,
  StudentAttendanceResponse,
} from "@/types";
import { describe, expect, it } from "vitest";
import {
  mapAttendanceToDisplayResult,
  mapCoachToDisplayResult,
} from "./checkInDisplayResult";

describe("PWA check-in display result mappers", () => {
  it("maps a coach check-in response to the displayed details", () => {
    const response: CoachTimesheetResponse = {
      timesheetId: "44f82268-0512-4c85-a9d4-bcba05e67b60",
      coachAssignmentId: "7edf8228-a77e-46ab-ae75-ac1fb92e1346",
      coach: {
        personId: "6b8c58d8-27d1-4b41-84cd-f2706d0f8f21",
        fullName: "Nguyễn Trung Đạt",
        staffCode: "VQT_datnt_311005",
        email: null,
      },
      classSchedule: {
        scheduleId: "P23C2",
        branchName: "Cơ sở 2",
        scheduleLocation: "INDOOR",
        scheduleLevel: "ADVANCED",
        scheduleShift: "CA_2",
        startTime: "19:30",
        endTime: "21:00",
        weekday: 3,
      },
      workingDate: "2026-07-28",
      checkInTime: "2026-07-28T18:45:54.606368",
      checkOutTime: null,
      status: "CHECKED_IN",
      note: "Coach check-in by staffCode scan",
      createdAt: "2026-07-28T18:45:54.7754774",
      updatedAt: "2026-07-28T18:45:54.7754774",
    };

    expect(mapCoachToDisplayResult(response)).toEqual({
      title: "Chấm công HLV thành công",
      name: "Nguyễn Trung Đạt",
      details: [
        { label: "Lớp", value: "P23C2" },
        { label: "Ngày làm việc", value: "28/07/2026" },
        { label: "Giờ check-in", value: "18:45" },
        { label: "Trạng thái", value: "Đã check-in" },
      ],
      note: "Coach check-in by staffCode scan",
    });
  });

  it("keeps student attendance fields mapped to their PWA labels", () => {
    const response: StudentAttendanceResponse = {
      attendanceId: "attendance-1",
      enrollmentId: "enrollment-1",
      studentSummary: {
        personId: "student-1",
        fullName: "Nguyễn An",
        email: "student@example.com",
        code: "VQ_001",
      },
      classSchedule: {
        scheduleId: "P23C1",
        branchName: "Văn Quán",
        scheduleLocation: "INDOOR",
        scheduleLevel: "KID",
        scheduleShift: "CA_1",
        startTime: "08:00",
        endTime: "09:00",
        weekday: 7,
      },
      sessionDate: "2026-07-28",
      attendanceStatus: "PRESENT",
      checkInTime: "2026-07-28T18:45:54.606368",
      recordedByCoachName: null,
      evaluationStatus: null,
      note: "Đến đúng giờ",
      evaluatedByCoachName: null,
      updatedAt: "2026-07-28T18:45:54.7754774",
    };

    expect(mapAttendanceToDisplayResult(response)).toEqual({
      title: "Điểm danh thành công",
      name: "Nguyễn An",
      details: [
        { label: "Lớp", value: "P23C1" },
        { label: "Ngày học", value: "28/07/2026" },
        { label: "Giờ điểm danh", value: "18:45" },
        { label: "Trạng thái", value: "Có mặt" },
      ],
      note: "Đến đúng giờ",
    });
  });
});
