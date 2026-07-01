declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export function getAppMode() {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const isPWA =
    window.matchMedia("(display-mode: standalone)").matches ||
    navigator.standalone === true;

  if (isPWA) return "pwa";
  if (isMobile) return "mobile-web";
  return "desktop";
}
