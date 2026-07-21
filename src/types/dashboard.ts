export type DashboardPeriod = "today" | "week" | "month" | "quarter" | "custom";

export type DashboardRoleScope = "branch" | "system";

export type DashboardBranchId = number | "ALL";

export interface DashboardBranchOption {
  id: number;
  name: string;
}

export interface DashboardUserScope {
  roleScope: DashboardRoleScope;
  canSelectAllBranches: boolean;
  defaultBranchId: DashboardBranchId;
  availableBranches: DashboardBranchOption[];
  displayName: string;
  roleLabel: string;
}

export interface DashboardFilters {
  branchId: DashboardBranchId;
  period: DashboardPeriod;
  comparePrevious: boolean;
}

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  tone: "brand" | "success" | "warning" | "info" | "dark";
  iconLabel: string;
  detail: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "flat";
    label: string;
  };
}

export interface StudentGrowthPoint {
  month: string;
  male: number;
  female: number;
  unknown: number;
  totalActive: number;
}

export interface AttendanceWeeklyPoint {
  day: string;
  present: number;
  late: number;
  absent: number;
  unreviewed: number;
}

export interface AttentionStudent {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  enrollmentId: string;
  classCode: string;
  branchId: number;
  branchName: string;
  reason: "absence" | "tuition" | "attendance-open";
  badge: string;
  detail: string;
  lastTrainingDate?: string;
}

export interface TodaySession {
  id: string;
  classCode: string;
  room: string;
  coachName: string;
  branchId: number;
  branchName: string;
  startTime: string;
  endTime: string;
  studentCount: number;
  status: "completed" | "in-progress" | "upcoming";
  attendanceStatus: "closed" | "open" | "not-opened";
}

export interface CoachTimesheetItem {
  id: string;
  coachName: string;
  shiftLabel: string;
  checkInTime?: string;
  status: "checked-in" | "late" | "missing";
  note: string;
}

export interface RecentPayment {
  id: string;
  studentName: string;
  studentCode: string;
  classCode: string;
  branchId: number;
  branchName: string;
  periodLabel: string;
  amount: number;
  paidAtLabel: string;
  method: string;
}

export interface BranchComparisonItem {
  branchId: number;
  branchName: string;
  totalDistinctStudents: number;
}

export interface BeltPromotionSummary {
  pendingResults: number;
  passedThisMonth: number;
  recentPromotions: string[];
}

export interface FitnessSummary {
  monthlyRecords: number;
  staleRecords: number;
  latestResults: string[];
}

export interface TodayOperationsSummary {
  totalSessions: number;
  coachCheckedIn: number;
  coachExpected: number;
  inProgressSessions: number;
  attendanceOpenSessions: number;
}

export interface DashboardPartialData {
  paymentsFromApi: boolean;
  missingBackendFields: string[];
}

export interface DashboardData {
  generatedAt: string;
  scope: DashboardUserScope;
  filters: DashboardFilters;
  kpis: DashboardKpi[];
  growth: StudentGrowthPoint[];
  attendanceWeekly: AttendanceWeeklyPoint[];
  attentionStudents: AttentionStudent[];
  todayOperations: TodayOperationsSummary;
  todaySessions: TodaySession[];
  coachTimesheet: CoachTimesheetItem[];
  recentPayments: RecentPayment[];
  branchComparison: BranchComparisonItem[];
  beltPromotion: BeltPromotionSummary;
  fitness: FitnessSummary;
  partialData: DashboardPartialData;
}

export interface DashboardRequest {
  filters: DashboardFilters;
  scope: DashboardUserScope;
}
