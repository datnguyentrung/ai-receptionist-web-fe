import { CONTEXT_SELECTION_ROUTE } from "@/features/auth/utils/authRouting";
import { useAuthStore } from "@/store/authStore";
import { Navigate, Outlet } from "react-router-dom";

export function RequireContext() {
  const authStatus = useAuthStore((state) => state.authStatus);

  if (authStatus === "initializing") {
    return null;
  }

  if (authStatus === "anonymous") {
    return <Navigate to="/login" replace />;
  }

  if (authStatus === "selecting-context") {
    return <Navigate to={CONTEXT_SELECTION_ROUTE} replace />;
  }

  return <Outlet />;
}
