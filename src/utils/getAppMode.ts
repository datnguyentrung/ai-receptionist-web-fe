import { detectAppEnvironment, isPwaStandalone } from "./appEnvironment";

export function getAppMode() {
  if (isPwaStandalone()) return "pwa";
  if (detectAppEnvironment().isMobile) return "mobile-web";
  return "desktop";
}

export const isPWA = getAppMode() === "pwa";
