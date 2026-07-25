// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AttendancePill } from "./AttendancePill";

let root: Root | null = null;
let container: HTMLDivElement | null = null;

function createPointerEvent(type: string) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    button: { value: 0 },
    pointerId: { value: 1 },
    pointerType: { value: "mouse" },
    clientX: { value: 20 },
    clientY: { value: 20 },
  });
  return event;
}

afterEach(async () => {
  if (root) {
    await act(async () => root?.unmount());
  }
  container?.remove();
  root = null;
  container = null;
  vi.useRealTimers();
});

describe("AttendancePill long press", () => {
  it("opens options only after holding the trigger for 500ms", async () => {
    vi.useFakeTimers();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <AttendancePill
          attendanceId="attendance-1"
          value="PRESENT"
          onChange={vi.fn()}
        />,
      );
    });

    const trigger = container.querySelector("button");
    expect(trigger).not.toBeNull();

    await act(async () => trigger?.dispatchEvent(createPointerEvent("pointerdown")));
    expect(container.querySelector('[role="menu"]')).toBeNull();

    await act(async () => vi.advanceTimersByTime(499));
    expect(container.querySelector('[role="menu"]')).toBeNull();

    await act(async () => vi.advanceTimersByTime(1));
    expect(container.querySelector('[role="menu"]')).not.toBeNull();
  });
});
