// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AppEnvironmentProvider,
  type BeforeInstallPromptEvent,
} from "./AppEnvironmentProvider";
import { PwaRequiredGate } from "./PwaRequiredGate";

let root: Root | null = null;
let container: HTMLDivElement | null = null;

function setAndroidBrowser() {
  Object.defineProperties(navigator, {
    userAgent: {
      configurable: true,
      value:
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/123.0 Mobile Safari/537.36",
    },
    userAgentData: { configurable: true, value: { mobile: true } },
    standalone: { configurable: true, value: false },
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
}

async function renderGate() {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <AppEnvironmentProvider>
        <PwaRequiredGate>
          <div>protected application</div>
        </PwaRequiredGate>
      </AppEnvironmentProvider>,
    );
  });
}

afterEach(async () => {
  if (root) {
    await act(async () => root?.unmount());
  }
  container?.remove();
  root = null;
  container = null;
  vi.restoreAllMocks();
});

describe("PwaRequiredGate", () => {
  it("blocks mobile browser children before the application mounts", async () => {
    setAndroidBrowser();
    await renderGate();

    expect(container?.textContent).toContain("Cài đặt ứng dụng để tiếp tục");
    expect(container?.textContent).not.toContain("protected application");
  });

  it("only opens the native install prompt after a user click", async () => {
    setAndroidBrowser();
    await renderGate();

    const prompt = vi.fn().mockResolvedValue(undefined);
    const installEvent = new Event("beforeinstallprompt", {
      cancelable: true,
    }) as BeforeInstallPromptEvent;
    Object.defineProperties(installEvent, {
      prompt: { value: prompt },
      userChoice: { value: Promise.resolve({ outcome: "dismissed" }) },
    });

    await act(async () => window.dispatchEvent(installEvent));
    expect(prompt).not.toHaveBeenCalled();

    const installButton = Array.from(
      container?.querySelectorAll("button") ?? [],
    ).find((button) => button.textContent?.includes("Cài đặt ứng dụng"));
    expect(installButton).toBeDefined();

    await act(async () => installButton?.click());
    expect(prompt).toHaveBeenCalledTimes(1);
  });
});
