import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { PullToRefreshProvider } from "./components/PullToRefresh";
import { isMaintenanceMode } from "./config/env";
import { MaintenancePage } from "./pages/MaintenancePage";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <PullToRefreshProvider>
          <AppRoutes />
        </PullToRefreshProvider>
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
