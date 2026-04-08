import { Navigate, Outlet } from "react-router-dom";

export const RequireRole = ({
  isAllowed,
  fallbackPath,
}: {
  isAllowed: boolean;
  fallbackPath: string;
}) => {
  return isAllowed ? <Outlet /> : <Navigate to={fallbackPath} replace />;
};
