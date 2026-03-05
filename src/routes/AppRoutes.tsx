import { LoginPage } from "@/features/auth";
import { MainLayout } from "@/layouts/MainLayout";
import { AttendanceReports } from "@/pages/AttendanceReports";
import { ClassSchedules } from "@/pages/ClassSchedules";
import { CoachManagement } from "@/pages/CoachManagement";
import { Dashboard } from "@/pages/Dashboard";
import HomePage from "@/pages/HomePage";
import { StudentManagement } from "@/pages/StudentManagement";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      {/* --- CÁC TRANG PROTECTED (Yêu cầu đăng nhập) --- */}
      {/* Định nghĩa một Route mẹ bọc ngoài cùng */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Các Route con nằm bên trong Layout */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="coaches" element={<CoachManagement />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="schedules" element={<ClassSchedules />} />
        <Route path="attendance" element={<AttendanceReports />} />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
