declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

const DISPLAY_MODES = [
  "standalone",
  "fullscreen",
  "minimal-ui",
  "window-controls-overlay",
] as const;

function matchesDisplayMode(mode: string) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }

  return window.matchMedia(`(display-mode: ${mode})`).matches;
}

export function getAppMode() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "desktop";
  }

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const isPWA =
    DISPLAY_MODES.some((mode) => matchesDisplayMode(mode)) ||
    navigator.standalone === true;

  if (isPWA) return "pwa";
  if (isMobile) return "mobile-web";
  return "desktop";
}

export const isPWA = getAppMode() === "pwa";
