import { coachAPI } from "@/features/coach/api/coachAPI";
import { coachTimesheetAPI } from "@/features/coach/api/coachTimesheetAPI";
import { classScheduleAPI } from "@/features/classSchedule/api/classScheduleAPI";
import { leaderboardAPI } from "@/features/report/api/LeaderboardAPI";
import { studentAPI } from "@/features/student/api/studentAPI";
import { studentAttendanceAPI } from "@/features/studentAttendance/api/studentAttendanceAPI";
import { classSchedulesQueryKey } from "@/features/classSchedule/queries/classSchedulesQueries";
import { prefetchNotifications } from "@/features/notification/queries/notificationQueries";
import { prefetchDashboard } from "@/pages/Dashboard/dashboardQueries";
import type { QueryClient } from "@tanstack/react-query";

export type RouteSkeletonKind =
  | "dashboard"
  | "utilities"
  | "check-in"
  | "profile"
  | "table"
  | "generic";

export type RoutePreloadContext = {
  queryClient: QueryClient;
  userId?: string;
  scheduleIds?: string[];
  canViewCoach?: boolean;
};

const PAGE_SIZE = parseInt(import.meta.env.VITE_PAGE_SIZE) || 30;
const DEFAULT_STUDENT_PAGE_SIZE = 10;

function normalizePath(value?: string | null) {
  const path = value?.trim() || "/";
  return path.replace(/\/+$/, "") || "/";
}

function getCurrentQuarter() {
  return Math.floor(new Date().getMonth() / 3) + 1;
}

function isProfilePath(pathname: string) {
  const normalizedPath = normalizePath(pathname);
  return (
    /^\/[^/]+$/.test(normalizedPath) &&
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
      "/public",
      "/rankings",
    ].includes(normalizedPath)
  );
}

export function getRouteSkeletonKind(pathname: string): RouteSkeletonKind {
  const normalizedPath = normalizePath(pathname);

  if (normalizedPath === "/") return "dashboard";
  if (normalizedPath === "/utilities") return "utilities";
  if (normalizedPath === "/check-in") return "check-in";
  if (isProfilePath(normalizedPath)) return "profile";
  if (
    normalizedPath === "/coaches" ||
    normalizedPath === "/students" ||
    normalizedPath === "/schedules" ||
    normalizedPath === "/history" ||
    normalizedPath.startsWith("/history/")
  ) {
    return "table";
  }

  return "generic";
}

function preloadProfile(pathname: string, context: RoutePreloadContext) {
  const userCode = normalizePath(pathname).slice(1);
  if (!userCode) return;

  if (userCode.startsWith("VQT")) {
    if (!context.canViewCoach) return;

    void context.queryClient.prefetchQuery({
      queryKey: ["coaches", userCode],
      queryFn: () => coachAPI.getCoachByStaffCode(userCode),
      staleTime: 5 * 60 * 1000,
    });
    return;
  }

  if (userCode.includes("_")) {
    void context.queryClient.prefetchQuery({
      queryKey: ["students", userCode],
      queryFn: () => studentAPI.getStudentByStudentCode(userCode),
      staleTime: 5 * 60 * 1000,
    });
  }
}

function preloadStudentManagement(context: RoutePreloadContext) {
  const scheduleIds = context.scheduleIds ?? [];
  const queryParams = {
    search: "",
    status: "all",
    belts: [] as string[],
    scheduleIds,
    page: 0,
    size: DEFAULT_STUDENT_PAGE_SIZE,
  };

  void context.queryClient.prefetchQuery({
    queryKey: ["students", queryParams],
    queryFn: () =>
      studentAPI.getStudents({
        search: "",
        scheduleIds,
        page: 0,
        size: DEFAULT_STUDENT_PAGE_SIZE,
      }),
  });
}

function preloadStudentAttendanceReports(context: RoutePreloadContext) {
  const scheduleIds = context.scheduleIds ?? [];
  const queryParams = {
    search: "",
    dateFilter: "",
    attendanceStatuses: [] as string[],
    evaluationStatuses: [] as string[],
    belts: [] as string[],
    branches: [] as number[],
    scheduleLevels: [] as string[],
    scheduleIds,
    page: 0,
    size: PAGE_SIZE,
  };

  void context.queryClient.prefetchQuery({
    queryKey: ["student-attendance", queryParams],
    queryFn: () =>
      studentAttendanceAPI.filter({
        search: "",
        page: 0,
        size: PAGE_SIZE,
        sessionDate: "",
        attendanceStatuses: [],
        evaluationStatuses: [],
        belts: [],
        branchIds: [],
        scheduleLevels: [],
        scheduleIds,
      }),
    staleTime: 5 * 60 * 1000,
  });
}

function preloadCoachTimesheetReports(context: RoutePreloadContext) {
  const params = {
    search: undefined,
    workDate: undefined,
    fromDate: undefined,
    toDate: undefined,
    month: undefined,
    year: undefined,
    branchId: undefined,
    status: undefined,
    page: 0,
    size: PAGE_SIZE,
    sortBy: "workingDate",
    sortDir: "desc" as const,
  };

  void context.queryClient.prefetchQuery({
    queryKey: ["coach-timesheets", params],
    queryFn: () => coachTimesheetAPI.getTimesheetsByFilter(params),
    staleTime: 5 * 60 * 1000,
  });
}

function preloadRankings(context: RoutePreloadContext, pathname: string) {
  const year = new Date().getFullYear();
  const quarter = getCurrentQuarter();

  if (normalizePath(pathname).endsWith("/fitness")) {
    void context.queryClient.prefetchQuery({
      queryKey: [
        "quarter-leaderboard",
        "fitness",
        { year, quarter, fitnessSkillLevel: "ADVANCED" },
      ],
      queryFn: () =>
        leaderboardAPI.getQuarterFitnessLeaderboard(
          year,
          quarter,
          "ADVANCED",
          0,
          300,
        ),
    });
    return;
  }

  void context.queryClient.prefetchQuery({
    queryKey: ["quarter-leaderboard", "score", { year, quarter }],
    queryFn: () =>
      leaderboardAPI.getQuarterScoreLeaderboard(year, quarter, 0, 30),
  });
}

export function preloadRoute(to: string, context: RoutePreloadContext) {
  const pathname = normalizePath(to);

  if (pathname === "/") {
    prefetchDashboard(context.queryClient);
    return;
  }

  if (pathname === "/utilities") {
    void import("@/pages/UtilitiesPage");
    return;
  }

  if (pathname === "/check-in") {
    void import("@/pages/AICheckIn");
    return;
  }

  if (pathname === "/notifications") {
    void import("@/pages/NotificationPage");
    prefetchNotifications(context.queryClient);
    return;
  }

  if (pathname.startsWith("/notifications/")) {
    void import("@/pages/NotificationPage");
    return;
  }

  if (pathname === "/coaches") {
    void import("@/pages/CoachManagement");
    void context.queryClient.prefetchQuery({
      queryKey: ["coaches"],
      queryFn: coachAPI.getAllCoaches,
    });
    return;
  }

  if (pathname === "/students") {
    void import("@/pages/StudentManagement");
    preloadStudentManagement(context);
    return;
  }

  if (pathname === "/schedules") {
    void import("@/pages/ClassSchedules");
    const scheduleIds = context.scheduleIds ?? [];
    void context.queryClient.prefetchQuery({
      queryKey: classSchedulesQueryKey(scheduleIds),
      queryFn: () => classScheduleAPI.getAllClassSchedules({ scheduleIds }),
    });
    return;
  }

  if (pathname === "/history" || pathname === "/history/student") {
    void import("@/pages/AttendanceReports");
    preloadStudentAttendanceReports(context);
    return;
  }

  if (pathname === "/history/coach") {
    void import("@/pages/AttendanceReports");
    preloadCoachTimesheetReports(context);
    return;
  }

  if (pathname === "/public/exam") {
    void import("@/pages/ExaminationManagement/ExaminationManagement");
    return;
  }

  if (pathname === "/rankings" || pathname.startsWith("/rankings/")) {
    preloadRankings(context, pathname);
    return;
  }

  if (isProfilePath(pathname)) {
    preloadProfile(pathname, context);
  }
}

export function preloadBottomNavRoutes(context: RoutePreloadContext) {
  const profilePath = context.userId ? `/${context.userId}` : undefined;
  for (const path of [
    "/",
    "/utilities",
    "/check-in",
    "/notifications",
    profilePath,
  ]) {
    if (path) preloadRoute(path, context);
  }
}
