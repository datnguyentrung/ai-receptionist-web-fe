import Avatar from "@/components/common/Avatar";
import { ModalLayout } from "@/components/ui/modal-layout";
import type {
  AttentionStudent,
  BranchComparisonItem,
  CoachTimesheetItem,
  DashboardBranchId,
  DashboardData,
  DashboardFilters,
  DashboardKpi,
  DashboardPeriod,
  DashboardUserScope,
  RecentPayment,
  TodaySession,
} from "@/types/dashboard";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Filter,
  MoreHorizontal,
  RefreshCcw,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "../Dashboard.module.scss";

const periodLabels: Record<DashboardPeriod, string> = {
  today: "Hôm nay",
  week: "Tuần này",
  month: "Tháng này",
  quarter: "Quý này",
  custom: "Tùy chỉnh",
};

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} ₫`;
}

function formatGeneratedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getAttendanceRate(data: DashboardData["attendanceWeekly"]) {
  const total = data.reduce(
    (sum, item) => sum + item.present + item.late + item.absent + item.unreviewed,
    0,
  );
  const attended = data.reduce((sum, item) => sum + item.present + item.late, 0);

  return total > 0 ? Math.round((attended / total) * 1000) / 10 : 0;
}

function getSessionStatusLabel(status: TodaySession["status"]) {
  if (status === "completed") return "Hoàn thành";
  if (status === "in-progress") return "Đang diễn ra";
  return "Sắp diễn ra";
}

function getAttendanceStatusLabel(status: TodaySession["attendanceStatus"]) {
  if (status === "closed") return "Điểm danh đã đóng";
  if (status === "open") return "Điểm danh đang mở";
  return "Chưa mở điểm danh";
}

function getCoachStatusClass(status: CoachTimesheetItem["status"]) {
  if (status === "checked-in") return styles.coachStatusCheckedIn;
  if (status === "late") return styles.coachStatusLate;
  return styles.coachStatusMissing;
}

function getKpiToneClass(tone: DashboardKpi["tone"]) {
  return styles[`kpiTone${tone[0].toUpperCase()}${tone.slice(1)}`];
}

function renderSkeletonLines(count: number, className: string) {
  return Array.from({ length: count }).map((_, index) => (
    <span key={index} className={className} />
  ));
}

export function DashboardHeader({
  data,
  onOpenFilters,
}: {
  data: DashboardData;
  onOpenFilters: () => void;
}) {
  const alertCount = data.attentionStudents.length;
  const branchLabel =
    data.filters.branchId === "ALL"
      ? "Toàn hệ thống"
      : data.scope.availableBranches.find((branch) => branch.id === data.filters.branchId)
          ?.name ?? "Chi nhánh";

  return (
    <header className={styles.pwaHero}>
      <div className={styles.pwaGreetingRow}>
        <div>
          <p className={styles.pwaGreeting}>Xin chào, {data.scope.displayName}</p>
          <h1 className={styles.pwaTitle}>Tổng quan</h1>
        </div>
        <div className={styles.pwaHeaderActions}>
          <button type="button" className={styles.pwaIconButton} aria-label="Mở thông báo">
            <Bell size={18} />
          </button>
          <Avatar
            fullName={data.scope.displayName}
            fontSize="13px"
            fontWeight={800}
            width="40px"
            height="40px"
          />
        </div>
      </div>
      <div className={styles.pwaScopeRow}>
        <p>Phạm vi: {branchLabel}</p>
        <span>{alertCount > 0 ? `${alertCount} cảnh báo mới` : "Không có cảnh báo"}</span>
      </div>
      <div className={styles.pwaFilterChips}>
        <button type="button" onClick={onOpenFilters} className={styles.pwaFilterChip}>
          {branchLabel}
          <ChevronDown size={14} />
        </button>
        <button type="button" onClick={onOpenFilters} className={styles.pwaFilterChip}>
          {periodLabels[data.filters.period]}
          <ChevronDown size={14} />
        </button>
        <button
          type="button"
          onClick={onOpenFilters}
          className={styles.pwaFilterIcon}
          aria-label="Mở bộ lọc dashboard"
        >
          <Filter size={16} />
        </button>
      </div>
    </header>
  );
}

export function DashboardFilters({
  filters,
  scope,
  onBranchChange,
  onPeriodChange,
  onCompareChange,
  onRefresh,
}: {
  filters: DashboardFilters;
  scope: DashboardUserScope;
  onBranchChange: (branchId: DashboardBranchId) => void;
  onPeriodChange: (period: DashboardPeriod) => void;
  onCompareChange: (comparePrevious: boolean) => void;
  onRefresh: () => void;
}) {
  return (
    <section className={styles.desktopHeader} aria-label="Bộ lọc phạm vi dữ liệu">
      <div>
        <h2>Tổng quan vận hành</h2>
        <p>Theo dõi học viên, lớp học, điểm danh và học phí</p>
      </div>
      <div className={styles.filterBar}>
        <button
          type="button"
          className={styles.filterButton}
          aria-label="Chọn phạm vi chi nhánh"
        >
          <span>
            {filters.branchId === "ALL"
              ? "Tất cả chi nhánh"
              : scope.availableBranches.find((branch) => branch.id === filters.branchId)
                  ?.name ?? "Chi nhánh"}
          </span>
          <ChevronDown size={14} />
        </button>
        {scope.canSelectAllBranches ? (
          <button
            type="button"
            className={`${styles.filterButton} ${
              filters.branchId === "ALL" ? styles.filterButtonActive : ""
            }`}
            onClick={() => onBranchChange("ALL")}
          >
            Tất cả
          </button>
        ) : null}
        {scope.availableBranches.map((branch) => (
          <button
            key={branch.id}
            type="button"
            className={`${styles.filterButton} ${
              filters.branchId === branch.id ? styles.filterButtonActive : ""
            }`}
            onClick={() => onBranchChange(branch.id)}
          >
            {branch.name}
          </button>
        ))}
        <button
          type="button"
          className={styles.filterButton}
          onClick={() =>
            onPeriodChange(filters.period === "month" ? "quarter" : "month")
          }
          aria-label="Đổi khoảng thời gian dashboard"
        >
          {periodLabels[filters.period]}
          <ChevronDown size={14} />
        </button>
        <button
          type="button"
          className={`${styles.filterButton} ${
            filters.comparePrevious ? styles.filterButtonActive : ""
          }`}
          onClick={() => onCompareChange(!filters.comparePrevious)}
        >
          So sánh kỳ trước
        </button>
        <button
          type="button"
          className={styles.refreshButton}
          onClick={onRefresh}
          aria-label="Tải lại Dashboard"
        >
          <RefreshCcw size={15} />
        </button>
      </div>
    </section>
  );
}

export function PriorityAlerts({ data }: { data: DashboardData }) {
  const absenceCount = data.attentionStudents.filter(
    (item) => item.reason === "absence",
  ).length;
  const tuitionCount = data.kpis.find((kpi) => kpi.id === "tuition-check")?.value ?? "0";

  if (absenceCount === 0 && tuitionCount === "0") {
    return <DashboardEmptyState type="alerts" compact />;
  }

  return (
    <section className={styles.priorityAlerts} aria-label="Cảnh báo ưu tiên">
      {absenceCount > 0 ? (
        <article className={`${styles.priorityAlert} ${styles.priorityAlertDanger}`}>
          <span className={styles.priorityIcon}>
            <AlertTriangle size={16} />
          </span>
          <div>
            <h3>{absenceCount} học viên nghỉ từ 3 buổi liên tiếp</h3>
            <p>Cần kiểm tra các trường hợp chưa quay lại</p>
          </div>
          <button type="button">Kiểm tra</button>
        </article>
      ) : null}
      {tuitionCount !== "0" ? (
        <article className={`${styles.priorityAlert} ${styles.priorityAlertWarning}`}>
          <span className={styles.priorityIcon}>đ</span>
          <div>
            <h3>{tuitionCount} học viên chưa ghi nhận học phí tháng 7</h3>
            <p>Học phí cần kiểm tra trong phạm vi hiện tại</p>
          </div>
          <button type="button">Xem ngay</button>
        </article>
      ) : null}
    </section>
  );
}

export function DashboardKpiGrid({ kpis }: { kpis: DashboardKpi[] }) {
  return (
    <section className={styles.kpiGrid} aria-label="Chỉ số vận hành">
      {kpis.map((kpi) => (
        <DashboardKpiCard key={kpi.id} kpi={kpi} />
      ))}
    </section>
  );
}

function DashboardKpiCard({ kpi }: { kpi: DashboardKpi }) {
  return (
    <article className={styles.kpiCard}>
      <div className={styles.kpiHeader}>
        <p>{kpi.label}</p>
        <span className={`${styles.kpiIcon} ${getKpiToneClass(kpi.tone)}`}>
          {kpi.iconLabel}
        </span>
      </div>
      <div className={styles.kpiMetric}>
        <strong>{kpi.value}</strong>
        {kpi.trend ? (
          <span
            className={`${styles.trendBadge} ${
              kpi.trend.direction === "down"
                ? styles.trendDown
                : kpi.trend.direction === "flat"
                  ? styles.trendFlat
                  : styles.trendUp
            }`}
          >
            {kpi.trend.value}
          </span>
        ) : null}
      </div>
      <p className={styles.kpiDetail}>{kpi.detail}</p>
      {kpi.trend ? <p className={styles.kpiTrendLabel}>{kpi.trend.label}</p> : null}
    </article>
  );
}

export function StudentGrowthChart({ data }: { data: DashboardData }) {
  return (
    <section className={`${styles.chartCard} ${styles.growthChart}`}>
      <div className={styles.chartHeader}>
        <div>
          <h3>Tăng trưởng học viên</h3>
          <p>Đếm theo distinct Student, không đếm lượt ghi danh</p>
        </div>
        <div className={styles.chartTabs} aria-label="Khoảng thời gian biểu đồ">
          <span>6 tháng</span>
          <span>12 tháng</span>
          <span>Năm nay</span>
        </div>
      </div>
      <p className={styles.srOnly}>
        Tổng học viên đang tập mới nhất là{" "}
        {data.growth[data.growth.length - 1]?.totalActive ?? 0}.
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data.growth} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
          <Tooltip content={<DashboardChartTooltip valueSuffix=" HV" />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="male" name="Nam" fill="#e02020" radius={[4, 4, 0, 0]} />
          <Bar dataKey="female" name="Nữ" fill="#1a1a2e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="unknown" name="Chưa cập nhật" fill="#9ca3af" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export function AttendanceWeeklyChart({ data }: { data: DashboardData }) {
  const rate = getAttendanceRate(data.attendanceWeekly);

  return (
    <section className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <h3>Điểm danh tuần</h3>
          <p>PRESENT + LATE / tổng StudentAttendance</p>
        </div>
        <button type="button" className={styles.linkButton}>
          Chi tiết
          <ArrowRight size={13} />
        </button>
      </div>
      <div className={styles.attendanceSummary}>
        <strong>{rate.toLocaleString("vi-VN")}%</strong>
        <span>Tỷ lệ có mặt</span>
      </div>
      <p className={styles.srOnly}>
        Tỷ lệ điểm danh tuần là {rate.toLocaleString("vi-VN")} phần trăm.
      </p>
      <ResponsiveContainer width="100%" height={170}>
        <BarChart data={data.attendanceWeekly} margin={{ top: 4, right: 0, left: -26, bottom: 0 }}>
          <CartesianGrid stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
          <YAxis hide domain={[0, "dataMax"]} />
          <Tooltip content={<DashboardChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="present" stackId="attendance" name="Có mặt" fill="#10b981" radius={[5, 5, 0, 0]} />
          <Bar dataKey="late" stackId="attendance" name="Muộn" fill="#f59e0b" />
          <Bar dataKey="absent" stackId="attendance" name="Vắng" fill="#ef4444" />
          <Bar dataKey="unreviewed" stackId="attendance" name="Chưa đánh giá" fill="#93c5fd" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

function DashboardChartTooltip({
  active,
  payload,
  label,
  valueSuffix = "",
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string;
  valueSuffix?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className={styles.chartTooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((item) => (
        <p key={item.name} className={styles.tooltipRow}>
          <span style={{ backgroundColor: item.color }} />
          {item.name}: <strong>{item.value}{valueSuffix}</strong>
        </p>
      ))}
    </div>
  );
}

export function AttentionSection({ students }: { students: AttentionStudent[] }) {
  return (
    <section className={styles.panel}>
      <SectionHeader
        title="Cần chú ý"
        subtitle="Ưu tiên xử lý theo mức độ ảnh hưởng"
        actionLabel="Xem tất cả cảnh báo"
      />
      {students.length === 0 ? (
        <DashboardEmptyState type="alerts" compact />
      ) : (
        <div className={styles.attentionList}>
          {students.slice(0, 4).map((student) => (
            <AttentionStudentItem key={student.id} student={student} />
          ))}
        </div>
      )}
    </section>
  );
}

function AttentionStudentItem({ student }: { student: AttentionStudent }) {
  return (
    <article className={styles.attentionItem}>
      <div className={styles.attentionAccent} aria-hidden="true" />
      <Avatar
        fullName={student.studentName}
        fontSize="12px"
        fontWeight={800}
        width="40px"
        height="40px"
      />
      <div className={styles.attentionMain}>
        <div className={styles.attentionTop}>
          <div>
            <h4>{student.studentName}</h4>
            <p>
              {student.studentCode} - {student.classCode} - {student.branchName}
            </p>
          </div>
          <span>{student.badge}</span>
        </div>
        <p className={styles.attentionDetail}>{student.detail}</p>
        <div className={styles.attentionActions}>
          <button type="button">Xem hồ sơ</button>
          <button type="button">Gọi</button>
          <button type="button">Nhắn</button>
          <button type="button" aria-label={`Mở tác vụ cho ${student.studentName}`}>
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function TodayOperationsSection({ data }: { data: DashboardData }) {
  return (
    <section className={styles.panel}>
      <SectionHeader title="Hôm nay" subtitle="Lịch học và trạng thái điểm danh" actionLabel="Xem lịch" />
      <div className={styles.todaySummary}>
        <MetricPair value={data.todayOperations.totalSessions} label="Buổi học" />
        <MetricPair
          value={`${data.todayOperations.coachCheckedIn}/${data.todayOperations.coachExpected}`}
          label="HLV check-in"
          tone="success"
        />
        <MetricPair value={data.todayOperations.inProgressSessions} label="Đang diễn ra" tone="info" />
        <MetricPair
          value={data.todayOperations.attendanceOpenSessions}
          label="Chưa đóng điểm danh"
          tone="warning"
        />
      </div>
      {data.todaySessions.length === 0 ? (
        <DashboardEmptyState type="sessions" compact />
      ) : (
        <div className={styles.sessionList}>
          {data.todaySessions.map((session) => (
            <TodaySessionItem key={session.id} session={session} />
          ))}
        </div>
      )}
    </section>
  );
}

function MetricPair({
  value,
  label,
  tone = "dark",
}: {
  value: string | number;
  label: string;
  tone?: "success" | "info" | "warning" | "dark";
}) {
  return (
    <div className={`${styles.metricPair} ${styles[`metric${tone}`]}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function TodaySessionItem({ session }: { session: TodaySession }) {
  return (
    <article className={styles.sessionItem}>
      <div className={styles.sessionTime}>
        <strong>{session.startTime}</strong>
        <span>{session.endTime}</span>
      </div>
      <div className={styles.sessionInfo}>
        <h4>
          {session.classCode} - {session.room}
        </h4>
        <p>
          HLV {session.coachName} - {session.studentCount} học viên
        </p>
      </div>
      <div className={styles.sessionState}>
        <span>{getSessionStatusLabel(session.status)}</span>
        <p>{getAttendanceStatusLabel(session.attendanceStatus)}</p>
      </div>
    </article>
  );
}

export function CoachTimesheetSummary({ items }: { items: CoachTimesheetItem[] }) {
  return (
    <section className={styles.panel}>
      <SectionHeader title="Chấm công HLV" subtitle="Theo ca hôm nay" actionLabel="Xem timesheet" />
      <div className={styles.coachList}>
        {items.map((item) => (
          <article key={item.id} className={styles.coachItem}>
            <Avatar
              fullName={item.coachName}
              fontSize="12px"
              fontWeight={800}
              width="40px"
              height="40px"
            />
            <div>
              <h4>{item.coachName}</h4>
              <p>
                {item.shiftLabel}
                {item.checkInTime ? ` - Check-in ${item.checkInTime}` : ""}
              </p>
            </div>
            <span className={getCoachStatusClass(item.status)}>{item.note}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export function RecentPaymentsSection({ payments }: { payments: RecentPayment[] }) {
  return (
    <section className={`${styles.panel} ${styles.paymentsPanel}`}>
      <SectionHeader title="Thanh toán gần đây" subtitle="Giao dịch học phí đã ghi nhận" actionLabel="Xem tất cả thanh toán" />
      {payments.length === 0 ? (
        <DashboardEmptyState type="payments" compact />
      ) : (
        <>
          <div className={styles.paymentTableWrap}>
            <table className={styles.paymentTable}>
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Mã HV</th>
                  <th>Lớp</th>
                  <th>Kỳ thanh toán</th>
                  <th>Số tiền</th>
                  <th>Chi nhánh</th>
                  <th>Thời gian</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.studentName}</td>
                    <td>{payment.studentCode}</td>
                    <td>{payment.classCode}</td>
                    <td>{payment.periodLabel}</td>
                    <td className={styles.paymentAmount}>{formatCurrency(payment.amount)}</td>
                    <td>{payment.branchName}</td>
                    <td>{payment.paidAtLabel}</td>
                    <td>{payment.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.paymentCards}>
            {payments.map((payment) => (
              <RecentPaymentItem key={payment.id} payment={payment} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function RecentPaymentItem({ payment }: { payment: RecentPayment }) {
  return (
    <article className={styles.paymentCard}>
      <div>
        <h4>
          {payment.studentName} - {payment.studentCode}
        </h4>
        <p>
          {payment.classCode} - {payment.periodLabel} - {payment.paidAtLabel}
        </p>
      </div>
      <strong>{formatCurrency(payment.amount)}</strong>
    </article>
  );
}

export function SupportingSections({ data }: { data: DashboardData }) {
  return (
    <section className={styles.supportingGrid} aria-label="Thông tin phụ">
      <article className={styles.supportingCard}>
        <h3>Nâng đai</h3>
        <p>Kỳ thi tháng 7</p>
        <div className={styles.supportingMetrics}>
          <MetricPair value={data.beltPromotion.pendingResults} label="Chờ kết quả" tone="warning" />
          <MetricPair value={data.beltPromotion.passedThisMonth} label="Đạt tháng này" tone="success" />
        </div>
        <strong>Vừa lên đai</strong>
        {data.beltPromotion.recentPromotions.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </article>
      <article className={styles.supportingCard}>
        <h3>Fitness</h3>
        <p>Đánh giá thể lực/kỹ năng</p>
        <div className={styles.supportingMetrics}>
          <MetricPair value={data.fitness.monthlyRecords} label="Lượt tháng" tone="info" />
          <MetricPair value={data.fitness.staleRecords} label="Trên 90 ngày" tone="warning" />
        </div>
        <strong>Kết quả mới nhất</strong>
        {data.fitness.latestResults.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </article>
      {data.filters.branchId === "ALL" ? (
        <BranchComparison items={data.branchComparison} />
      ) : null}
    </section>
  );
}

function BranchComparison({ items }: { items: BranchComparisonItem[] }) {
  const max = Math.max(...items.map((item) => item.totalDistinctStudents), 1);

  return (
    <article className={styles.supportingCard}>
      <h3>So sánh chi nhánh</h3>
      <p>Tổng học viên distinct Student</p>
      <div className={styles.branchBars}>
        {items.map((item) => (
          <div key={item.branchId} className={styles.branchBarItem}>
            <div>
              <span>{item.branchName}</span>
              <strong>{item.totalDistinctStudents}</strong>
            </div>
            <progress value={item.totalDistinctStudents} max={max}>
              {item.totalDistinctStudents}
            </progress>
          </div>
        ))}
      </div>
    </article>
  );
}

function SectionHeader({
  title,
  subtitle,
  actionLabel,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
}) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actionLabel ? (
        <button type="button" className={styles.linkButton}>
          {actionLabel}
          <ArrowRight size={13} />
        </button>
      ) : null}
    </div>
  );
}

export function DashboardStateMessage({
  type,
  onRetry,
}: {
  type: "error" | "empty" | "filter-empty";
  onRetry?: () => void;
}) {
  const title =
    type === "error"
      ? "Không thể tải dữ liệu"
      : type === "filter-empty"
        ? "Không có dữ liệu theo bộ lọc"
        : "Dashboard chưa có dữ liệu";
  const description =
    type === "error"
      ? "Kiểm tra kết nối và thử lại."
      : type === "filter-empty"
        ? "Hãy đổi phạm vi chi nhánh hoặc thời gian để xem dữ liệu khác."
        : "Khi backend trả dữ liệu vận hành, thông tin sẽ xuất hiện tại đây.";

  return (
    <section className={styles.stateCard} role={type === "error" ? "alert" : "status"}>
      <span className={styles.stateIcon}>
        {type === "error" ? <AlertTriangle size={24} /> : <Check size={24} />}
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {type === "error" && onRetry ? (
        <button type="button" onClick={onRetry} className={styles.retryButton}>
          <RefreshCcw size={14} />
          Thử lại
        </button>
      ) : null}
    </section>
  );
}

export function DashboardEmptyState({
  type,
  compact = false,
}: {
  type: "alerts" | "payments" | "sessions";
  compact?: boolean;
}) {
  const copy = {
    alerts: ["Không có cảnh báo", "Mọi vấn đề vận hành hiện đã được xử lý."],
    payments: ["Chưa có thanh toán gần đây", "Giao dịch mới sẽ xuất hiện tại đây."],
    sessions: ["Không có buổi học hôm nay", "Lịch học mới sẽ xuất hiện tại đây."],
  }[type];

  return (
    <div className={`${styles.emptyState} ${compact ? styles.emptyStateCompact : ""}`}>
      <span aria-hidden="true" />
      <h3>{copy[0]}</h3>
      <p>{copy[1]}</p>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.pwaSkeletonHero} aria-hidden="true">
        <span className={styles.skeletonLineSm} />
        <span className={styles.skeletonLineLg} />
        <div className={styles.skeletonChipRow}>{renderSkeletonLines(3, styles.skeletonChip)}</div>
      </div>
      <div className={styles.skeletonDesktopHeader} aria-hidden="true">
        <span className={styles.skeletonLineLg} />
        <span className={styles.skeletonLineMd} />
      </div>
      <section className={styles.kpiGrid} aria-label="Đang tải chỉ số">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={styles.skeletonKpi}>
            <span className={styles.skeletonLineMd} />
            <span className={styles.skeletonMetric} />
            <span className={styles.skeletonLineLg} />
          </div>
        ))}
      </section>
      <div className={styles.mainGrid}>
        <div className={`${styles.skeletonPanel} ${styles.skeletonPanelWide}`}>
          <span className={styles.skeletonLineMd} />
          <div className={styles.skeletonBars}>{renderSkeletonLines(12, styles.skeletonBar)}</div>
        </div>
        <div className={styles.skeletonPanel}>
          <span className={styles.skeletonLineMd} />
          <div className={styles.skeletonBars}>{renderSkeletonLines(7, styles.skeletonBarShort)}</div>
        </div>
      </div>
      <div className={styles.skeletonPanel}>
        <span className={styles.skeletonLineMd} />
        {renderSkeletonLines(4, styles.skeletonRow)}
      </div>
    </div>
  );
}

export function PwaFilterSheet({
  open,
  filters,
  scope,
  onClose,
  onBranchChange,
  onPeriodChange,
  onCompareChange,
  onReset,
}: {
  open: boolean;
  filters: DashboardFilters;
  scope: DashboardUserScope;
  onClose: () => void;
  onBranchChange: (branchId: DashboardBranchId) => void;
  onPeriodChange: (period: DashboardPeriod) => void;
  onCompareChange: (comparePrevious: boolean) => void;
  onReset: () => void;
}) {
  const periods: DashboardPeriod[] = ["today", "week", "month", "quarter", "custom"];

  return (
    <ModalLayout
      open={open}
      onClose={onClose}
      maxWidth={390}
      closeOnDragDown
      showCloseButton={false}
      showMobileHandle={false}
      surfaceClassName={styles.filterSheetSurface}
      bodyClassName={styles.filterSheetBody}
    >
      <div className={styles.filterSheetHandle} aria-hidden="true" data-modal-drag-handle="true">
        <span />
      </div>

      <div className={styles.filterSheetHeader}>
        <h2>Bộ lọc dashboard</h2>
        <button type="button" onClick={onClose} aria-label="Đóng bộ lọc">
          ×
        </button>
      </div>

      <div className={styles.filterSheetContent}>
        <div className={styles.filterSheetSection}>
          <p>CHI NHÁNH</p>
          <div className={styles.sheetChipGrid}>
            {scope.canSelectAllBranches ? (
              <button
                type="button"
                onClick={() => onBranchChange("ALL")}
                className={filters.branchId === "ALL" ? styles.sheetChipActive : ""}
              >
                Tất cả
              </button>
            ) : null}
            {scope.availableBranches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => onBranchChange(branch.id)}
                className={filters.branchId === branch.id ? styles.sheetChipActive : ""}
              >
                {branch.name}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.filterSheetSection}>
          <p>THỜI GIAN</p>
          <div className={styles.sheetChipGrid}>
            {periods.map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => onPeriodChange(period)}
                className={filters.period === period ? styles.sheetChipActive : ""}
              >
                {periodLabels[period]}
              </button>
            ))}
          </div>
        </div>
        <label className={styles.compareToggle}>
          <input
            type="checkbox"
            checked={filters.comparePrevious}
            onChange={(event) => onCompareChange(event.currentTarget.checked)}
          />
          <span aria-hidden="true">{filters.comparePrevious ? <Check size={14} /> : null}</span>
          So sánh với kỳ trước
        </label>
        <p className={styles.filterUpdated}>Cập nhật gần nhất: 17:12, 20/07/2026</p>
      </div>

      <div className={styles.filterSheetFooter}>
        <button type="button" onClick={onReset} className={styles.sheetSecondaryButton}>
          Đặt lại
        </button>
        <button type="button" onClick={onClose} className={styles.sheetPrimaryButton}>
          Áp dụng bộ lọc
        </button>
      </div>
    </ModalLayout>
  );
}

export function DashboardFootnote({ data }: { data: DashboardData }) {
  return (
    <p className={styles.footnote}>
      Quy ước: Học viên = COUNT DISTINCT Student; điểm danh = PRESENT + LATE /
      tổng StudentAttendance. Kéo xuống để làm mới - Cập nhật{" "}
      {formatGeneratedAt(data.generatedAt)}.
    </p>
  );
}

export function PartialDataNotice({ data }: { data: DashboardData }) {
  if (data.partialData.missingBackendFields.length === 0) return null;

  return (
    <aside className={styles.partialNotice} aria-label="Dữ liệu một phần">
      <strong>Dữ liệu một phần</strong>
      <span>Đang dùng mock cho dashboard aggregate, sẵn sàng thay bằng API backend.</span>
    </aside>
  );
}

export function CloseIconButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={styles.closeIconButton} aria-label="Đóng">
      <X size={18} />
    </button>
  );
}

export function CalendarIconLabel() {
  return (
    <span className={styles.iconLabel}>
      <CalendarDays size={14} />
      Tháng này
    </span>
  );
}

export function ClockIconLabel() {
  return (
    <span className={styles.iconLabel}>
      <Clock size={14} />
      Hôm nay
    </span>
  );
}

export function UsersIconLabel() {
  return (
    <span className={styles.iconLabel}>
      <Users size={14} />
      Vận hành
    </span>
  );
}
