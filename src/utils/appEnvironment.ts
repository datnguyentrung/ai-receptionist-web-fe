export type AppEnvironment =
  | "CHECKING"
  | "DESKTOP_BROWSER"
  | "MOBILE_BROWSER"
  | "MOBILE_PWA";

export type AppPlatform = "android" | "ios" | "other";

export interface AppEnvironmentResult {
  environment: AppEnvironment;
  platform: AppPlatform;
  isMobile: boolean;
  isDesktop: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChecking: boolean;
}

declare global {
  interface Navigator {
    standalone?: boolean;
    userAgentData?: {
      mobile?: boolean;
    };
  }
}

export const PWA_DISPLAY_MODES = [
  "standalone",
  "fullscreen",
  "minimal-ui",
  "window-controls-overlay",
] as const;

function isBrowserRuntime() {
  return typeof window !== "undefined" && typeof navigator !== "undefined";
}

function matchesDisplayMode(mode: (typeof PWA_DISPLAY_MODES)[number]) {
  try {
    return window.matchMedia?.(`(display-mode: ${mode})`).matches === true;
  } catch {
    return false;
  }
}

export function isPwaStandalone() {
  if (!isBrowserRuntime()) {
    return false;
  }

  return (
    PWA_DISPLAY_MODES.some(matchesDisplayMode) || navigator.standalone === true
  );
}

export function createCheckingAppEnvironment(): AppEnvironmentResult {
  return {
    environment: "CHECKING",
    platform: "other",
    isMobile: false,
    isDesktop: false,
    isStandalone: false,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChecking: true,
  };
}

export function detectAppEnvironment(): AppEnvironmentResult {
  if (!isBrowserRuntime()) {
    return createCheckingAppEnvironment();
  }

  const userAgent = navigator.userAgent ?? "";
  const platform = navigator.platform ?? "";
  const isIOSByUserAgent = /iPhone|iPad|iPod/i.test(userAgent);
  const isIPadOSDesktopMode =
    platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const isIOS = isIOSByUserAgent || isIPadOSDesktopMode;
  const isAndroid = /Android/i.test(userAgent);
  const isMobileByUserAgent =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(
      userAgent,
    );
  const isMobile =
    navigator.userAgentData?.mobile === true ||
    isMobileByUserAgent ||
    isIPadOSDesktopMode;
  const isStandalone = isPwaStandalone();
  const detectedPlatform: AppPlatform = isIOS
    ? "ios"
    : isAndroid
      ? "android"
      : "other";
  const isSafari =
    isIOS &&
    /Safari/i.test(userAgent) &&
    !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(userAgent);
  const environment: AppEnvironment = isMobile
    ? isStandalone
      ? "MOBILE_PWA"
      : "MOBILE_BROWSER"
    : "DESKTOP_BROWSER";

  return {
    environment,
    platform: detectedPlatform,
    isMobile,
    isDesktop: !isMobile,
    isStandalone,
    isIOS,
    isAndroid,
    isSafari,
    isChecking: false,
  };
}
