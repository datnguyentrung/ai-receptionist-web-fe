import { RequireRole } from "@/config/RequireRole";
import { LoginPage } from "@/features/auth";
import { MainLayout } from "@/layouts/MainLayout";
import { AttendanceReports } from "@/pages/AttendanceReports";
import { ClassSchedules } from "@/pages/ClassSchedules";
import { CoachManagement } from "@/pages/CoachManagement";
import { Dashboard } from "@/pages/Dashboard";
import HomePage from "@/pages/HomePage";
import { StudentManagement } from "@/pages/StudentManagement";
import { useRoleStudent } from "@/utils/roleUtils";
import { Navigate, Route, Routes } from "react-router-dom";
import AICheckIn from "../pages/AICheckIn";
import { AttendanceCheckin } from "../pages/AttendanceCheckin/AttendanceCheckin";
import { useAuthStore } from "../store/authStore";
import ExaminationManagement from '../pages/ExaminationManagement/ExaminationManagement';

export default function AppRoutes() {
  const { isAuthenticated } = useAuthStore();

  // Lưu sẵn các cờ quyền hạn để code JSX gọn hơn
  const { canViewManager, canViewCoach } = useRoleStudent();

  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/welcome" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/public" element={<MainLayout />}>
        <Route path="exam" element={<ExaminationManagement />} />
      </Route>

      {/* --- PROTECTED ROUTES --- */}
      <Route
        path="/"
        element={
          isAuthenticated ? <MainLayout /> : <Navigate to="/welcome" replace />
        }
      >
        {/* NHÓM 1: CHỈ MANAGER VÀ HEAD_COACH ĐƯỢC XEM */}
        {/* Nếu Coach cố tình truy cập "/", đẩy họ sang trang mặc định của họ là "/schedules" */}
        <Route
          element={
            <RequireRole isAllowed={canViewManager} fallbackPath="/students" />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="coaches" element={<CoachManagement />} />
        </Route>

        {/* NHÓM 2: COACH TRỞ LÊN ĐƯỢC XEM (Manager/Head Coach tất nhiên cũng xem được do logic isCoach) */}
        {/* Nếu ai đó role thấp hơn Coach (VD: Học sinh) cố tình vào, đẩy ra /welcome */}
        <Route
          element={
            <RequireRole isAllowed={canViewCoach} fallbackPath="/welcome" />
          }
        >
          <Route path="students" element={<StudentManagement />} />
          <Route path="schedules" element={<ClassSchedules />} />
          <Route path="schedules/:scheduleId" element={<AttendanceCheckin />} />
          <Route path="history" element={<AttendanceReports />} />
          <Route path="ai/check-in" element={<AICheckIn />} />
        </Route>
      </Route>

      {/* --- CATCH ALL --- */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/welcome"} replace />}
      />
    </Routes>
  );
}
