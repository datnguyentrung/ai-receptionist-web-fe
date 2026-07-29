/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  CheckInResponse,
  StudentAttendanceResponse,
  StudentDetail,
} from "@/types";

vi.mock("/taekwondo.jpg", () => ({ default: "/taekwondo.jpg" }));

import { CheckInCard } from "./CheckInCard";

const faceCheckInResult: CheckInResponse = {
  audio_signal: "CHECKIN_SUCCESS",
  status: true,
  user: null,
  attendance_record: {
    attendanceId: "attendance-1",
    enrollmentId: "enrollment-1",
    student: {
      personId: "student-1",
      fullName: "Nguyễn An",
      email: "student@example.com",
      code: "VQ_001",
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
    sessionDate: "2026-07-26",
    attendanceStatus: "PRESENT",
    checkInTime: "2026-07-26T08:00:00Z",
    recordedByCoachName: null,
    evaluationStatus: null,
    note: null,
    evaluatedByCoachName: null,
    updatedAt: "2026-07-26T08:00:00Z",
  } as unknown as StudentAttendanceResponse,
  message: "Điểm danh Nguyễn An thành công.",
};

const recognizedStudent = {
  personType: "STUDENT",
  personId: "student-1",
  fullName: "Nguyễn An",
  studentCode: "VQ_001",
  belt: "C10",
  studentStatus: "ACTIVE",
  branchName: "Văn Quán",
} as StudentDetail & { personType: "STUDENT" };

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
  vi.useRealTimers();
});

describe("CheckInCard", () => {
  it("keeps the result visible until the user confirms", () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    act(() => {
      root?.render(
        <CheckInCard user={faceCheckInResult} onConfirm={onConfirm} />,
      );
    });

    const dialog = container.querySelector('[role="dialog"]');
    const confirmButton = container.querySelector("button");

    expect(dialog).not.toBeNull();
    expect(confirmButton?.textContent).toContain("OK, quét người tiếp theo");
    expect(document.activeElement).toBe(confirmButton);

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(onConfirm).not.toHaveBeenCalled();

    act(() => confirmButton?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("shows a recognized person without success affordances for a business failure", () => {
    const onConfirm = vi.fn();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    act(() => {
      root?.render(
        <CheckInCard
          user={{
            audio_signal: "NO_VALID_SESSION",
            status: false,
            user: null,
            attendance_record: null,
            coachTimesheet: null,
            message: "Học viên không ở trạng thái hoạt động",
            recognizedPerson: recognizedStudent,
          }}
          onConfirm={onConfirm}
        />,
      );
    });

    expect(container.textContent).toContain("Học viên không ở trạng thái hoạt động");
    expect(container.textContent).toContain("Nguyễn An");
    expect(container.textContent).toContain("VQ_001");
    expect(container.textContent).toContain("Quét tiếp");
    expect(container.textContent).not.toContain("Đã ghi nhận");
  });
});
