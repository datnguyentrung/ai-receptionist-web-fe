/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("/taekwondo.jpg", () => ({ default: "/taekwondo.jpg" }));

import { PwaCheckInScannerShell } from "./PwaCheckInScannerShell";

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

describe("PwaCheckInScannerShell", () => {
  it("shows the recognized person details for an HTTP 200 business failure", () => {
    const onRetry = vi.fn();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    act(() => {
      root?.render(
        <PwaCheckInScannerShell
          mode="FACE_SCAN"
          status="error"
          statusLabel="Lỗi"
          message="Học viên không ở trạng thái hoạt động"
          lastScannedCode={null}
          successfulScanCount={2}
          displayResult={{
            title: "Điểm danh chưa thành công",
            name: "Nguyễn Văn A",
            details: [
              { label: "Mã học viên", value: "VQ_001" },
              { label: "Đai", value: "WHITE" },
            ],
          }}
          showBackButton={false}
          camera={<div />}
          onModeChange={vi.fn()}
          onBack={vi.fn()}
          onSwitchCamera={vi.fn()}
          onCancel={vi.fn()}
          onRetry={onRetry}
          onResultOk={vi.fn()}
        />,
      );
    });

    expect(container.textContent).toContain("Điểm danh chưa thành công");
    expect(container.textContent).toContain("Nguyễn Văn A");
    expect(container.textContent).toContain("VQ_001");
    expect(container.textContent).toContain("Học viên không ở trạng thái hoạt động");
    expect(container.textContent).not.toContain("Đã check-in 2 người");

    const retryButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Quét tiếp"),
    );
    expect(retryButton).toBeDefined();

    act(() => retryButton?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("renders AI khuôn mặt before Quét mã in the mode switch", () => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    act(() => {
      root?.render(
        <PwaCheckInScannerShell
          mode="FACE_SCAN"
          status="scanning"
          statusLabel="Đang quét"
          message="Sẵn sàng nhận diện khuôn mặt."
          lastScannedCode={null}
          successfulScanCount={0}
          displayResult={null}
          showBackButton={false}
          camera={<div />}
          onModeChange={vi.fn()}
          onBack={vi.fn()}
          onSwitchCamera={vi.fn()}
          onCancel={vi.fn()}
          onRetry={vi.fn()}
          onResultOk={vi.fn()}
        />,
      );
    });

    const modeButtons = Array.from(container.querySelectorAll("button")).filter(
      (btn) =>
        btn.textContent?.includes("AI khuôn mặt") ||
        btn.textContent?.includes("Quét mã"),
    );

    expect(modeButtons).toHaveLength(2);
    expect(modeButtons[0].textContent).toContain("AI khuôn mặt");
    expect(modeButtons[1].textContent).toContain("Quét mã");
  });
});
