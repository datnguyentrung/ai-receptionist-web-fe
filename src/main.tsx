import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/react-query";
import { useAuthStore } from "./store/authStore";
import { initFcm, syncFcmToken } from "./services/fcm";

initFcm()
  .then((isSupported) => {
    // Nếu trình duyệt hỗ trợ và đã login thì mới tính chuyện đồng bộ token
    if (isSupported && useAuthStore.getState().isAuthenticated) {
      syncFcmToken().catch(() => {});
    }
  })
  .catch(() => {});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
