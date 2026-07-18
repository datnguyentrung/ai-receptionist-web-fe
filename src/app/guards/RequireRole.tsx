import { writeDebugStorage } from "@/utils/debugStorage";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export const RequireRole = ({
  isAllowed,
  fallbackPath,
  roles,
}: {
  isAllowed?: boolean;
  fallbackPath: string;
  roles?: readonly string[];
}) => {
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const allowed = isAllowed ?? (roles ? hasAnyRole(roles) : false);

  useEffect(() => {
    if (allowed) return;

    writeDebugStorage("app_last_redirect_debug", {
      source: "RequireRole",
      fallbackPath,
      reason: "role_not_allowed",
    });
  }, [fallbackPath, allowed]);

  return allowed ? <Outlet /> : <Navigate to={fallbackPath} replace />;
};
