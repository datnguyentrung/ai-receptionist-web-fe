import { RequireRole } from "@/config/RequireRole";
import { useRoleStudent } from "@/utils/roleUtils";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PersonalPage from "../pages/PersonalPage/PersonalPage";
import Rankings from "../pages/Rankings";
import { useAuthStore } from "../store/authStore";

const MainLayout = lazy(() =>
  import("@/layouts/MainLayout").then((module) => ({
    default: module.MainLayout,
  })),
);
const Welcome = lazy(() => import("@/pages/Welcome"));
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
  // Lấy thêm 'user' từ store để biết userCode của người đang đăng nhập
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  // Lưu sẵn các cờ quyền hạn để code JSX gọn hơn
  const { canViewManagerSenior, canViewCoach } = useRoleStudent();

  // Xác định đường dẫn trang cá nhân của user hiện tại
  const personalPageRoute = user?.userInfo?.userCode
    ? `/${user.userInfo.userCode}`
    : "/welcome";

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/welcome" element={<Welcome />} />
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
          {/* NHÓM 1: CHỈ MANAGER_SENIOR VÀ HEAD_COACH ĐƯỢC XEM */}
          <Route
            element={
              <RequireRole
                isAllowed={canViewManagerSenior}
                // Nếu không phải Manager, đẩy xuống kiểm tra xem có phải Coach không (vào schedules)
                fallbackPath="/schedules"
              />
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="coaches" element={<CoachManagement />} />
          </Route>

          {/* NHÓM 2: COACH TRỞ LÊN ĐƯỢC XEM */}
          <Route
            element={
              <RequireRole
                isAllowed={canViewCoach}
                // QUAN TRỌNG: Nếu không phải Coach (tức là Student), đẩy về trang cá nhân của họ
                fallbackPath={personalPageRoute}
              />
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

          {/* NHÓM 3: CÁC ROLE KHÁC (VD: ASSISTANT, STUDENT) ĐƯỢC XEM TRANG NÀY */}
          <Route>
            <Route path=":userCode" element={<PersonalPage />} />
            <Route path="rankings" element={<Rankings />} />
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
