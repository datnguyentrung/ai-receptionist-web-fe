import { writeDebugStorage } from "@/utils/debugStorage";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

export const RequireRole = ({
  isAllowed,
  fallbackPath,
}: {
  isAllowed: boolean;
  fallbackPath: string;
}) => {
  useEffect(() => {
    if (isAllowed) return;

    writeDebugStorage("app_last_redirect_debug", {
      source: "RequireRole",
      fallbackPath,
      reason: "role_not_allowed",
    });
  }, [fallbackPath, isAllowed]);

  return isAllowed ? <Outlet /> : <Navigate to={fallbackPath} replace />;
};
