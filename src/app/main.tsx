import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { APP_MODE } from "@/config/appMode";
import { isMaintenanceMode } from "@/config/env";
import "@/index.css";
import { queryClient } from "@/lib/react-query";
import { initFcm } from "@/integrations/firebase/fcm";
import { AuthBootstrap } from "@/app/providers/AuthBootstrap";

if (!isMaintenanceMode) {
  initFcm().catch(() => {});
}

function syncAppModeAttribute() {
  document.body.dataset.appMode = APP_MODE;
  document.documentElement.dataset.appMode = APP_MODE;
}

syncAppModeAttribute();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
        <App />
      </AuthBootstrap>
    </QueryClientProvider>
  </StrictMode>,
);
