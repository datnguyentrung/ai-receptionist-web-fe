import { RequireRole } from "@/config/RequireRole";
import { isPWA } from "@/config/appMode";
import { PwaStackScreenLayout } from "@/layouts/PwaStackScreenLayout";
import { useRoleStudent } from "@/utils/roleUtils";
import { lazy, Suspense } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AccessDeniedView } from "../components/AccessDeniedView";
import ComingSoonView from "../components/ComingSoonView";
import { ClassSchedulesRoute } from "../pages/ClassSchedules/ClassSchedulesRoute";
import AttendanceTab from "../pages/PersonalPage/components/AttendanceTab";
import PersonalInfoTab from "../pages/PersonalPage/components/PersonalInfoTab";
import ScheduleAssignments from "../pages/PersonalPage/components/ScheduleAssignments";
import ScoreTab from "../pages/PersonalPage/components/ScoreTab/ScoreTab";
import TimesheetTab from "../pages/PersonalPage/components/TimesheetTab";
import TuitionTab from "../pages/PersonalPage/components/TuitionTab/TuitionTab";
import PersonalPage from "../pages/PersonalPage/PersonalPage";
import Rankings from "../pages/Rankings";
import { useAuthStore } from "../store/authStore";
import fallbackStyles from "./RouteLoadingFallback.module.scss";

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
const UtilitiesPage = lazy(() =>
  import("@/pages/UtilitiesPage").then((module) => ({
    default: module.UtilitiesPage,
  })),
);
const AICheckIn = lazy(() => import("@/pages/AICheckIn"));
const ExaminationManagement = lazy(
  () => import("@/pages/ExaminationManagement/ExaminationManagement"),
);

function RouteLoadingFallback({ pathname = "/" }: { pathname?: string }) {
  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  const isProfileRoute =
    /^\/[^/]+/.test(normalizedPath) &&
    ![
      "/coaches",
      "/students",
      "/schedules",
      "/history",
      "/utilities",
      "/check-in",
      "/notifications",
      "/welcome",
      "/login",
    ].includes(normalizedPath);
  const rowCount = normalizedPath.includes("history") ? 7 : 5;

  return (
    <div className={fallbackStyles.routeShell} aria-busy="true">
      <div className={fallbackStyles.appChrome}>
        <div className={fallbackStyles.topBar} />
        {isProfileRoute ? (
          <>
            <div className={fallbackStyles.profileHeader}>
              <div className={fallbackStyles.avatar} />
              <div className={fallbackStyles.profileLines}>
                <div className={fallbackStyles.line} />
                <div className={fallbackStyles.line} />
              </div>
            </div>
            <div className={fallbackStyles.tabRow}>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={fallbackStyles.pill} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className={fallbackStyles.hero} />
            <div className={fallbackStyles.metrics}>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={fallbackStyles.metric} />
              ))}
            </div>
          </>
        )}
        <div className={fallbackStyles.panel} />
        {normalizedPath.includes("students") ||
        normalizedPath.includes("history") ? (
          <div className={fallbackStyles.table}>
            {Array.from({ length: rowCount }).map((_, index) => (
              <div key={index} className={fallbackStyles.row} />
            ))}
          </div>
        ) : (
          <div className={fallbackStyles.contentGrid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={fallbackStyles.card} />
            ))}
          </div>
        )}
      </div>
      <div className={fallbackStyles.bottomDock} />
    </div>
  );
}

function getProfileStackTitle(pathname: string) {
  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  const segment = normalizedPath.split("/").filter(Boolean).at(-1);

  switch (segment) {
    case "classes":
      return "Lớp hành chính";
    case "progress":
      return "Tiến trình học tập";
    case "tuition":
      return "Học phí";
    case "score":
      return "Điểm rèn luyện";
    case "timesheet":
      return "Thời khóa biểu";
    default:
      return "Thông tin học viên";
  }
}

function ProfileRouteLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (!isPWA) {
    return <MainLayout />;
  }

  return (
    <PwaStackScreenLayout
      title={getProfileStackTitle(pathname)}
      onBack={() => {
        if (window.history.length > 1) {
          navigate(-1);
          return;
        }

        navigate("/", { replace: true });
      }}
    >
      <Outlet />
    </PwaStackScreenLayout>
  );
}

export default function AppRoutes() {
  const { pathname } = useLocation();
  // Lấy thêm 'user' từ store để biết userCode của người đang đăng nhập
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.activeProfile);

  // Lưu sẵn các cờ quyền hạn để code JSX gọn hơn
  const { canViewManagerSenior, canViewCoach, canUseCheckIn } =
    useRoleStudent();

  // Xác định đường dẫn trang cá nhân của user hiện tại
  const personalPageRoute = user?.userInfo?.userCode
    ? `/${user.userInfo.userCode}`
    : "/welcome";

  if (!hasHydrated) {
    return <RouteLoadingFallback pathname={pathname} />;
  }

  return (
    <Suspense fallback={<RouteLoadingFallback pathname={pathname} />}>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/marketing" element={<MainLayout />}>
          <Route path="facebook" element={<div>Facebook Marketing</div>} />
        </Route>

        <Route path="/403" element={<AccessDeniedView />} />

        <Route path="/public" element={<MainLayout />}>
          <Route path="exam" element={<ExaminationManagement />} />
        </Route>

        <Route path="/rankings" element={<MainLayout />}>
          {/* Thay đổi element của index thành Navigate để tự động chuyển hướng */}
          <Route index element={<Navigate to="fitness" replace />} />

          {/* Bỏ dấu / ở trước path con */}
          <Route path="score" element={<Rankings />} />
          <Route path="fitness" element={<Rankings />} />
        </Route>

        {/* NHÓM 3: CÁC ROLE KHÁC (VD: ASSISTANT, STUDENT) ĐƯỢC XEM TRANG NÀY */}
        <Route path="/" element={<ProfileRouteLayout />}>
          <Route path="/:userCode" element={<PersonalPage />}>
            {/* Route mặc định: nếu chỉ vào /students/123 thì tự động redirect sang tab info */}
            <Route index element={<PersonalInfoTab />} />

            {/* Các tab con của STUDENT */}
            <Route path="classes" element={<ScheduleAssignments />} />
            <Route path="progress" element={<AttendanceTab />} />
            <Route path="tuition" element={<TuitionTab />} />
            <Route path="score" element={<ScoreTab />} />

            {/* Các tab con cả COACH */}
            <Route path="timesheet" element={<TimesheetTab />} />
          </Route>
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
          <Route path="utilities" element={<UtilitiesPage />} />
          <Route
            path="notifications"
            element={
              <ComingSoonView
                featureName="Thông báo"
                description="Bảng thông báo trung tâm đang được kết nối lại."
              />
            }
          />
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
            <Route path="schedules" element={<ClassSchedulesRoute />} />
            <Route
              path="schedules/:scheduleId"
              element={<AttendanceCheckin />}
            />
            <Route path="history" element={<AttendanceReports />} />
          </Route>

          <Route
            element={
              <RequireRole
                isAllowed={canUseCheckIn}
                fallbackPath="/403"
              />
            }
          >
            <Route path="check-in" element={<AICheckIn />} />
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
