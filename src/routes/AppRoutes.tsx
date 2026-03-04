import { LoginPage } from "@/features/auth";
import HomePage from "@/pages/HomePage";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div className="p-8">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Trang chủ sau khi đăng nhập - Coming soon!
              </p>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
