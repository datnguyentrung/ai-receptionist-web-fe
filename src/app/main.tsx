import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AllowedAppRuntime } from "./AllowedAppRuntime";
import { APP_MODE } from "@/config/appMode";
import { isPwaStandalone } from "@/utils/isPwaStandalone";
import "@/index.css";
import { queryClient } from "@/lib/react-query";
import {
  AppEnvironmentProvider,
  PwaRequiredGate,
} from "@/app/providers/pwa-required";

function syncAppModeAttribute() {
  document.body.dataset.appMode = APP_MODE;
  document.documentElement.dataset.appMode = APP_MODE;

  const standalone = isPwaStandalone();
  document.documentElement.toggleAttribute("data-pwa-standalone", standalone);
  document.body.toggleAttribute("data-pwa-standalone", standalone);
  document.getElementById("root")?.toggleAttribute("data-pwa-standalone", standalone);
}

syncAppModeAttribute();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppEnvironmentProvider>
        <PwaRequiredGate>
          <AllowedAppRuntime />
        </PwaRequiredGate>
      </AppEnvironmentProvider>
    </QueryClientProvider>
  </StrictMode>,
);
