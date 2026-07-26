/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CheckInResponse } from "@/types";

vi.mock("/taekwondo.jpg", () => ({ default: "/taekwondo.jpg" }));

import { CheckInCard } from "./CheckInCard";

const faceCheckInResult: CheckInResponse = {
  audio_signal: "CHECKIN_SUCCESS",
  status: true,
  user: null,
  attendance_record: {
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
  },
  message: "Điểm danh Nguyễn An thành công.",
};

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
});
