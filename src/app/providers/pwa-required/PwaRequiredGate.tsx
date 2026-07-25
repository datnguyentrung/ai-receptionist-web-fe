import { type ReactNode } from "react";
import { useAppEnvironment } from "./AppEnvironmentProvider";
import { MobilePwaRequiredScreen } from "./MobilePwaRequiredScreen";

function AppEnvironmentLoadingScreen() {
  return <main aria-busy="true" aria-label="Đang chuẩn bị ứng dụng" />;
}

export function PwaRequiredGate({ children }: { children: ReactNode }) {
  const { appEnvironment } = useAppEnvironment();

  if (appEnvironment.isChecking) {
    return <AppEnvironmentLoadingScreen />;
  }

  if (appEnvironment.environment === "MOBILE_BROWSER") {
    return <MobilePwaRequiredScreen />;
  }

  return <>{children}</>;
}
