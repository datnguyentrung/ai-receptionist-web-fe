import { useAuthStore } from "@/store/authStore";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const authStatus = useAuthStore((state) => state.authStatus);

  if (authStatus === "initializing") {
    return null;
  }

  if (authStatus === "anonymous") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
