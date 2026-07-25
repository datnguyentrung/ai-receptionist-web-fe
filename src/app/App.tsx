import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AppErrorBoundary } from "@/app/errors/AppErrorBoundary";
import { PullToRefreshProvider } from "@/app/providers/pull-to-refresh";
import { PwaStandalonePullToRefreshGuard } from "@/app/providers/pwa-standalone/PwaStandalonePullToRefreshGuard";
import { isMaintenanceMode } from "@/config/env";
import { MaintenancePage } from "@/pages/MaintenancePage";
import AppRoutes from "@/app/router/AppRoutes";

export default function App() {
  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <PullToRefreshProvider>
          <PwaStandalonePullToRefreshGuard />
          <AppRoutes />
        </PullToRefreshProvider>
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
