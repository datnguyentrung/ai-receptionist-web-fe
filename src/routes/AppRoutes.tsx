import { RequireRole } from "@/config/RequireRole";
import { useRoleStudent } from "@/utils/roleUtils";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const MainLayout = lazy(() =>
  import("@/layouts/MainLayout").then((module) => ({
    default: module.MainLayout,
  })),
);
const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() =>
  import("@/features/auth").then((module) => ({ default: module.LoginPage })),
);
const Dashboard = lazy(() =>
  import("@/pages/Dashboard").then((module) => ({
    default: module.Dashboard,
  })),
);
const CoachManagement = lazy(() =>
  import("@/pages/CoachManagement").then((module) => ({
    default: module.CoachManagement,
  })),
);
const StudentManagement = lazy(() =>
  import("@/pages/StudentManagement").then((module) => ({
    default: module.StudentManagement,
  })),
);
const ClassSchedules = lazy(() =>
  import("@/pages/ClassSchedules").then((module) => ({
    default: module.ClassSchedules,
  })),
);
const AttendanceCheckin = lazy(() =>
  import("@/pages/AttendanceCheckin").then((module) => ({
    default: module.AttendanceCheckin,
  })),
);
const AttendanceReports = lazy(() =>
  import("@/pages/AttendanceReports").then((module) => ({
    default: module.AttendanceReports,
  })),
);
const AICheckIn = lazy(() => import("@/pages/AICheckIn"));
const ExaminationManagement = lazy(
  () => import("@/pages/ExaminationManagement/ExaminationManagement"),
);

function RouteLoadingFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        color: "#6B7280",
        fontSize: "14px",
      }}
    >
      Đang tải trang...
    </div>
  );
}

export default function AppRoutes() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Lưu sẵn các cờ quyền hạn để code JSX gọn hơn
  const { canViewManager, canViewCoach } = useRoleStudent();

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
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
            isAuthenticated ? (
              <MainLayout />
            ) : (
              <Navigate to="/welcome" replace />
            )
          }
        >
          {/* NHÓM 1: CHỈ MANAGER VÀ HEAD_COACH ĐƯỢC XEM */}
          {/* Nếu Coach cố tình truy cập "/", đẩy họ sang trang mặc định của họ là "/schedules" */}
          <Route
            element={
              <RequireRole
                isAllowed={canViewManager}
                fallbackPath="/students"
              />
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
            <Route
              path="schedules/:scheduleId"
              element={<AttendanceCheckin />}
            />
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
    </Suspense>
  );
}
