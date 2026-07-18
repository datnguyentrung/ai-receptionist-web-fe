import { useAuthStore } from "@/store/authStore";
import { Navigate, Outlet } from "react-router-dom";

export function RequireAuth() {
  const authStatus = useAuthStore((state) => state.authStatus);

  if (authStatus === "initializing") {
    return null;
  }

  return authStatus === "anonymous" ? (
    <Navigate to="/login" replace />
  ) : (
    <Outlet />
  );
}
