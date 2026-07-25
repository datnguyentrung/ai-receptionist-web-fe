import { AuthBootstrap } from "@/app/providers/AuthBootstrap";
import { isMaintenanceMode } from "@/config/env";
import { initFcm } from "@/integrations/firebase/fcm";
import { useEffect } from "react";
import App from "./App";

export function AllowedAppRuntime() {
  useEffect(() => {
    if (isMaintenanceMode) {
      return;
    }

    void initFcm().catch(() => {});
  }, []);

  return (
    <AuthBootstrap>
      <App />
    </AuthBootstrap>
  );
}
