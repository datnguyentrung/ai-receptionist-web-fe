import { LoginPage } from "@/features/auth";
import { MainLayout } from "@/layouts/MainLayout";
import { AttendanceReports } from "@/pages/AttendanceReports";
import { ClassSchedules } from "@/pages/ClassSchedules";
import { CoachManagement } from "@/pages/CoachManagement";
import { Dashboard } from "@/pages/Dashboard";
import HomePage from "@/pages/HomePage";
import { StudentManagement } from "@/pages/StudentManagement";
import { Navigate, Route, Routes } from "react-router-dom";
// import ProtectedRoute from "./ProtectedRoute"; // Có thể bỏ đi nếu áp dụng cách dưới
import { AttendanceCheckin } from '../pages/AttendanceCheckin/AttendanceCheckin';
import { useAuthStore } from '../store/authStore';

export default function AppRoutes() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/welcome" element={<HomePage />} />

      {/* Nếu ĐÃ đăng nhập mà cố vào /login -> Đẩy về trang chủ (Dashboard) */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* --- PROTECTED ROUTES --- */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <MainLayout /> // Nếu ĐÃ đăng nhập: render Layout chứa các trang con
          ) : (
            <Navigate to="/welcome" replace /> // Nếu CHƯA đăng nhập: luôn đẩy về welcome
          )
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="coaches" element={<CoachManagement />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="schedules" element={<ClassSchedules />} />
        <Route path="attendance" element={<AttendanceReports />} />
        <Route path="schedules/:scheduleId" element={<AttendanceCheckin />} />
      </Route>

      {/* --- CATCH ALL (Đường dẫn không tồn tại) --- */}
      {/* Đã đăng nhập -> về Dashboard ("/"). Chưa đăng nhập -> về "/welcome" */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/welcome"} replace />}
      />
    </Routes>
  );
}
