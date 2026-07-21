import type {
  AttentionStudent,
  BeltPromotionSummary,
  BranchComparisonItem,
  CoachTimesheetItem,
  DashboardBranchOption,
  DashboardData,
  DashboardFilters,
  DashboardKpi,
  DashboardUserScope,
  FitnessSummary,
  RecentPayment,
  StudentGrowthPoint,
  TodayOperationsSummary,
  TodaySession,
  AttendanceWeeklyPoint,
} from "@/types/dashboard";

export const DASHBOARD_BRANCHES: DashboardBranchOption[] = [
  { id: 3, name: "Quận 3" },
  { id: 7, name: "Quận 7" },
  { id: 10, name: "Quận 10" },
  { id: 12, name: "Thủ Đức" },
];

const growth: StudentGrowthPoint[] = [
  { month: "T8", male: 116, female: 92, unknown: 5, totalActive: 213 },
  { month: "T9", male: 128, female: 96, unknown: 6, totalActive: 230 },
  { month: "T10", male: 121, female: 99, unknown: 7, totalActive: 227 },
  { month: "T11", male: 142, female: 111, unknown: 8, totalActive: 261 },
  { month: "T12", male: 151, female: 119, unknown: 9, totalActive: 279 },
  { month: "T1", male: 164, female: 127, unknown: 9, totalActive: 300 },
  { month: "T2", male: 171, female: 135, unknown: 10, totalActive: 316 },
  { month: "T3", male: 188, female: 146, unknown: 11, totalActive: 345 },
  { month: "T4", male: 206, female: 158, unknown: 11, totalActive: 375 },
  { month: "T5", male: 224, female: 171, unknown: 12, totalActive: 407 },
  { month: "T6", male: 251, female: 184, unknown: 12, totalActive: 447 },
  { month: "T7", male: 278, female: 196, unknown: 12, totalActive: 486 },
];

const attendanceWeekly: AttendanceWeeklyPoint[] = [
  { day: "T2", present: 184, late: 8, absent: 14, unreviewed: 5 },
  { day: "T3", present: 214, late: 9, absent: 17, unreviewed: 4 },
  { day: "T4", present: 201, late: 7, absent: 15, unreviewed: 3 },
  { day: "T5", present: 228, late: 10, absent: 13, unreviewed: 5 },
  { day: "T6", present: 219, late: 8, absent: 16, unreviewed: 6 },
  { day: "T7", present: 154, late: 5, absent: 12, unreviewed: 4 },
  { day: "CN", present: 126, late: 3, absent: 9, unreviewed: 4 },
];

const attentionStudents: AttentionStudent[] = [
  {
    id: "attention-1",
    studentId: "ST-0248",
    studentCode: "HV-0248",
    studentName: "Nguyễn Minh Long",
    enrollmentId: "ENR-1048",
    classCode: "P14C1",
    branchId: 7,
    branchName: "Quận 7",
    reason: "absence",
    badge: "Vắng 3 buổi",
    detail: "Vắng: 12/07, 15/07, 19/07. Chưa quay lại 9 ngày",
    lastTrainingDate: "11/07",
  },
  {
    id: "attention-2",
    studentId: "ST-0184",
    studentCode: "HV-0184",
    studentName: "Trần Gia Hân",
    enrollmentId: "ENR-1184",
    classCode: "P26C1",
    branchId: 3,
    branchName: "Quận 3",
    reason: "absence",
    badge: "Vắng 3 buổi",
    detail: "Vắng: 13/07, 16/07, 20/07. Chưa quay lại 9 ngày",
    lastTrainingDate: "12/07",
  },
  {
    id: "attention-3",
    studentId: "ST-0331",
    studentCode: "HV-0331",
    studentName: "Phạm Quang Huy",
    enrollmentId: "ENR-1331",
    classCode: "P34C1",
    branchId: 12,
    branchName: "Thủ Đức",
    reason: "absence",
    badge: "Vắng 3 buổi",
    detail: "Vắng: 10/07, 14/07, 18/07. Chưa quay lại 9 ngày",
    lastTrainingDate: "10/07",
  },
  {
    id: "attention-4",
    studentId: "ST-0290",
    studentCode: "HV-0290",
    studentName: "Hoàng Anh Thư",
    enrollmentId: "ENR-1290",
    classCode: "P14C1",
    branchId: 7,
    branchName: "Quận 7",
    reason: "tuition",
    badge: "Học phí cần kiểm tra",
    detail: "Chưa ghi nhận học phí tháng 7 trong dữ liệu hiện tại",
  },
];

const todaySessions: TodaySession[] = [
  {
    id: "session-1",
    classCode: "P26C1",
    room: "Phòng B",
    coachName: "Trần Đức Nam",
    branchId: 3,
    branchName: "Quận 3",
    startTime: "16:00",
    endTime: "17:30",
    studentCount: 24,
    status: "completed",
    attendanceStatus: "open",
  },
  {
    id: "session-2",
    classCode: "P14C1",
    room: "Phòng A",
    coachName: "Trần Đức Nam",
    branchId: 7,
    branchName: "Quận 7",
    startTime: "18:00",
    endTime: "19:30",
    studentCount: 28,
    status: "in-progress",
    attendanceStatus: "open",
  },
  {
    id: "session-3",
    classCode: "P34C1",
    room: "Sân chính",
    coachName: "Lê Thanh Tùng",
    branchId: 12,
    branchName: "Thủ Đức",
    startTime: "19:45",
    endTime: "21:15",
    studentCount: 22,
    status: "upcoming",
    attendanceStatus: "not-opened",
  },
];

const coachTimesheet: CoachTimesheetItem[] = [
  {
    id: "coach-time-1",
    coachName: "Trần Đức Nam",
    shiftLabel: "Ca 17:30",
    checkInTime: "17:42",
    status: "late",
    note: "Muộn 12 phút",
  },
  {
    id: "coach-time-2",
    coachName: "Lê Thanh Tùng",
    shiftLabel: "Ca 18:00",
    checkInTime: "17:50",
    status: "checked-in",
    note: "Đã check-in",
  },
  {
    id: "coach-time-3",
    coachName: "Phạm Thu Hà",
    shiftLabel: "Ca 19:00",
    status: "missing",
    note: "Chưa check-in",
  },
];

const recentPayments: RecentPayment[] = [
  {
    id: "pay-1",
    studentName: "Lê Hải Yến",
    studentCode: "HV-0312",
    classCode: "P26C1",
    branchId: 3,
    branchName: "Quận 3",
    periodLabel: "Tháng 7/2026",
    amount: 1200000,
    paidAtLabel: "16:24 hôm nay",
    method: "Chuyển khoản",
  },
  {
    id: "pay-2",
    studentName: "Nguyễn Minh Long",
    studentCode: "HV-0248",
    classCode: "P14C1",
    branchId: 7,
    branchName: "Quận 7",
    periodLabel: "Tháng 7/2026",
    amount: 800000,
    paidAtLabel: "15:52 hôm nay",
    method: "Tiền mặt",
  },
  {
    id: "pay-3",
    studentName: "Trần Gia Hân",
    studentCode: "HV-0184",
    classCode: "P26C1",
    branchId: 3,
    branchName: "Quận 3",
    periodLabel: "Quý 3/2026",
    amount: 3200000,
    paidAtLabel: "14:18 hôm nay",
    method: "Chuyển khoản",
  },
  {
    id: "pay-4",
    studentName: "Phạm Quang Huy",
    studentCode: "HV-0331",
    classCode: "P34C1",
    branchId: 12,
    branchName: "Thủ Đức",
    periodLabel: "Tháng 7/2026",
    amount: 950000,
    paidAtLabel: "11:03 hôm nay",
    method: "Tiền mặt",
  },
];

const branchComparison: BranchComparisonItem[] = [
  { branchId: 3, branchName: "Quận 3", totalDistinctStudents: 132 },
  { branchId: 7, branchName: "Quận 7", totalDistinctStudents: 111 },
  { branchId: 12, branchName: "Thủ Đức", totalDistinctStudents: 93 },
  { branchId: 10, branchName: "Quận 10", totalDistinctStudents: 76 },
];

const beltPromotion: BeltPromotionSummary = {
  pendingResults: 18,
  passedThisMonth: 42,
  recentPromotions: ["Mai Anh - Đai xanh", "Hoàng Nam - Đai đỏ", "Gia Linh - Đai vàng"],
};

const fitness: FitnessSummary = {
  monthlyRecords: 126,
  staleRecords: 34,
  latestResults: [
    "Nguyễn Long - 18/07 - Đã ghi nhận",
    "Gia Hân - 18/07 - Đã ghi nhận",
    "Minh Khoa - 17/07 - Đã ghi nhận",
  ],
};

const todayOperations: TodayOperationsSummary = {
  totalSessions: 18,
  coachCheckedIn: 14,
  coachExpected: 16,
  inProgressSessions: 2,
  attendanceOpenSessions: 3,
};

function filterByBranch<T extends { branchId: number }>(
  items: T[],
  branchId: DashboardFilters["branchId"],
) {
  return branchId === "ALL" ? items : items.filter((item) => item.branchId === branchId);
}

function buildKpis(filters: DashboardFilters): DashboardKpi[] {
  const scopedAttention = filterByBranch(attentionStudents, filters.branchId);
  const activeStudents = filters.branchId === "ALL" ? 486 : 111;
  const newStudents = filters.branchId === "ALL" ? 34 : 8;
  const tuitionCheck = scopedAttention.filter((item) => item.reason === "tuition").length || 12;

  return [
    {
      id: "active-students",
      label: "Học viên đang tập",
      value: String(activeStudents),
      tone: "brand",
      iconLabel: "HV",
      detail: filters.branchId === "ALL"
        ? "Nam 278 - Nữ 196 - Chưa cập nhật 12"
        : "Đếm distinct Student trong phạm vi chi nhánh",
      trend: { value: "+6,4%", direction: "up", label: "so với tháng trước" },
    },
    {
      id: "new-students",
      label: "Học viên mới",
      value: String(newStudents),
      tone: "success",
      iconLabel: "+",
      detail: "trong tháng 7",
      trend: { value: "+8 học viên", direction: "up", label: "6 tuần gần nhất" },
    },
    {
      id: "attendance-week",
      label: "Điểm danh tuần",
      value: "91,6%",
      tone: "info",
      iconLabel: "DD",
      detail: "Có mặt 1.284 - Vắng 76 - Muộn 42",
      trend: { value: "+2,1%", direction: "up", label: "so với tuần trước" },
    },
    {
      id: "tuition-check",
      label: "Học phí cần kiểm tra",
      value: String(tuitionCheck),
      tone: "warning",
      iconLabel: "đ",
      detail: "Chưa ghi nhận học phí trong tháng",
      trend: { value: "Cần rà soát", direction: "flat", label: "không phải công nợ" },
    },
  ];
}

export function buildDashboardMockData(
  filters: DashboardFilters,
  scope: DashboardUserScope,
): DashboardData {
  const scopedSessions = filterByBranch(todaySessions, filters.branchId);
  const scopedAttention = filterByBranch(attentionStudents, filters.branchId);
  const scopedPayments = filterByBranch(recentPayments, filters.branchId);

  return {
    generatedAt: "2026-07-20T17:12:00+07:00",
    scope,
    filters,
    kpis: buildKpis(filters),
    growth,
    attendanceWeekly,
    attentionStudents: scopedAttention,
    todayOperations,
    todaySessions: scopedSessions,
    coachTimesheet,
    recentPayments: scopedPayments,
    branchComparison,
    beltPromotion,
    fitness,
    partialData: {
      paymentsFromApi: false,
      missingBackendFields: [
        "Dashboard aggregate API",
        "Branch permission scope API",
        "Tuition missing-recognition aggregate",
      ],
    },
  };
}
