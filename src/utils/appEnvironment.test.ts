// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { detectAppEnvironment } from "./appEnvironment";

const navigatorProperties = [
  "userAgent",
  "platform",
  "maxTouchPoints",
  "standalone",
  "userAgentData",
] as const;

const originalNavigatorDescriptors = new Map(
  navigatorProperties.map((property) => [
    property,
    Object.getOwnPropertyDescriptor(navigator, property),
  ]),
);

function setNavigator(options: {
  userAgent: string;
  platform?: string;
  maxTouchPoints?: number;
  standalone?: boolean;
  mobile?: boolean;
}) {
  Object.defineProperties(navigator, {
    userAgent: { configurable: true, value: options.userAgent },
    platform: { configurable: true, value: options.platform ?? "Win32" },
    maxTouchPoints: { configurable: true, value: options.maxTouchPoints ?? 0 },
    standalone: { configurable: true, value: options.standalone ?? false },
    userAgentData: {
      configurable: true,
      value: options.mobile === undefined ? undefined : { mobile: options.mobile },
    },
  });
}

function setDisplayModes(activeModes: string[] = []) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: activeModes.some((mode) => query.includes(mode)),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  navigatorProperties.forEach((property) => {
    const descriptor = originalNavigatorDescriptors.get(property);
    if (descriptor) {
      Object.defineProperty(navigator, property, descriptor);
      return;
    }

    Reflect.deleteProperty(navigator, property);
  });
  vi.restoreAllMocks();
});

describe("detectAppEnvironment", () => {
  it("keeps a small desktop window in the desktop browser environment", () => {
    setNavigator({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123.0 Safari/537.36",
    });
    setDisplayModes();

    expect(detectAppEnvironment()).toMatchObject({
      environment: "DESKTOP_BROWSER",
      isDesktop: true,
      isMobile: false,
    });
  });

  it("recognizes Android browser and Android standalone PWA", () => {
    setNavigator({
      userAgent:
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/123.0 Mobile Safari/537.36",
      mobile: true,
    });
    setDisplayModes();
    expect(detectAppEnvironment().environment).toBe("MOBILE_BROWSER");

    setDisplayModes(["standalone"]);
    expect(detectAppEnvironment()).toMatchObject({
      environment: "MOBILE_PWA",
      isAndroid: true,
      isStandalone: true,
    });
  });

  it("recognizes iPhone Safari and iOS standalone mode", () => {
    setNavigator({
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
    });
    setDisplayModes();
    expect(detectAppEnvironment()).toMatchObject({
      environment: "MOBILE_BROWSER",
      isIOS: true,
      isSafari: true,
    });

    setNavigator({
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
      standalone: true,
    });
    expect(detectAppEnvironment().environment).toBe("MOBILE_PWA");
  });

  it("recognizes iPadOS when it reports a desktop-style Mac platform", () => {
    setNavigator({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
      platform: "MacIntel",
      maxTouchPoints: 5,
    });
    setDisplayModes();

    expect(detectAppEnvironment()).toMatchObject({
      environment: "MOBILE_BROWSER",
      isIOS: true,
      isMobile: true,
    });
  });

  it("fails safely for server rendering", () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("navigator", undefined);

    expect(detectAppEnvironment().environment).toBe("CHECKING");
  });
});
