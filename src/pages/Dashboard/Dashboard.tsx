import type { StudentEnrollmentResDTO } from "@/data/mockData";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  DollarSign,
  Minus,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ATTENDANCE_RATE,
  CLASSES,
  ENROLLMENTS,
  MONTHLY_ENROLLMENT,
  STATS,
} from "../../data/mockData";
import styles from "./Dashboard.module.scss";

// ── helpers ──────────────────────────────────────────────────
function avatarColor(initials: string) {
  const colors = [
    "#E02020",
    "#7C3AED",
    "#059669",
    "#0284C7",
    "#D97706",
    "#DB2777",
  ];
  let hash = 0;
  for (const c of initials) hash += c.charCodeAt(0);
  return colors[hash % colors.length];
}

function StatusBadge({
  status,
}: {
  status: StudentEnrollmentResDTO["status"];
}) {
  const map = {
    active: {
      label: "Đang học",
      bg: "#D1FAE5",
      color: "#065F46",
      dot: "#10B981",
    },
    pending: {
      label: "Chờ duyệt",
      bg: "#FEF3C7",
      color: "#92400E",
      dot: "#F59E0B",
    },
    completed: {
      label: "Hoàn thành",
      bg: "#E0E7FF",
      color: "#3730A3",
      dot: "#6366F1",
    },
    cancelled: {
      label: "Đã hủy",
      bg: "#FEE2E2",
      color: "#991B1B",
      dot: "#EF4444",
    },
  };
  const s = map[status];
  return (
    <span
      className={styles.statusBadge}
      style={{ background: s.bg, color: s.color }}
    >
      <span className={styles.statusDot} style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

function PayBadge({
  status,
}: {
  status: StudentEnrollmentResDTO["paymentStatus"];
}) {
  const map = {
    paid: { label: "Đã thanh toán", color: "#059669" },
    unpaid: { label: "Chưa thanh toán", color: "#DC2626" },
    partial: { label: "Thanh toán 1 phần", color: "#D97706" },
  };
  const s = map[status];
  return (
    <span style={{ fontSize: "11px", fontWeight: 600, color: s.color }}>
      {s.label}
    </span>
  );
}

// ── Stat Card ────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  trendLabel,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  trend?: number;
  trendLabel?: string;
  accent: string;
}) {
  const positive = (trend ?? 0) >= 0;
  return (
    <div className={styles.statCard}>
      <div className={styles.statCardHead}>
        <div className={styles.statCardBody}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#9CA3AF",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: "30px",
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.1,
              marginTop: "4px",
            }}
          >
            {value}
          </p>
          {sub && (
            <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
              {sub}
            </p>
          )}
        </div>
        <div
          className={styles.statIconWrap}
          style={{ background: accent + "15" }}
        >
          <Icon size={22} style={{ color: accent }} />
        </div>
      </div>
      {trend !== undefined && (
        <div className={styles.statTrend} style={{ borderColor: "#F3F4F6" }}>
          {trend === 0 ? (
            <Minus size={13} style={{ color: "#9CA3AF" }} />
          ) : positive ? (
            <TrendingUp size={13} style={{ color: "#10B981" }} />
          ) : (
            <TrendingDown size={13} style={{ color: "#EF4444" }} />
          )}
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: trend === 0 ? "#9CA3AF" : positive ? "#10B981" : "#EF4444",
            }}
          >
            {trend === 0 ? "Không đổi" : `${positive ? "+" : ""}${trend}`}
          </span>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
            {trendLabel}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────
type TooltipPayloadEntry = { value: number | string; name: string };
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280" }}>
        {label}
      </p>
      <p style={{ fontSize: "14px", fontWeight: 700, color: "#E02020" }}>
        {payload[0].value}
        {payload[0].name === "rate" ? "%" : " HV"}
      </p>
    </div>
  );
}

// ── Today's classes mini list ─────────────────────────────────
const todayClasses = CLASSES.filter((c) => c.status === "ongoing").slice(0, 3);

// ── Main Dashboard ────────────────────────────────────────────
export function Dashboard() {
  return (
    <div className={styles.dashboard}>
      {/* Greeting banner */}
      <div className={styles.banner}>
        <svg
          className={styles.bannerBg}
          viewBox="0 0 600 120"
          preserveAspectRatio="xMidYMid slice"
        >
          <circle cx="500" cy="20" r="100" fill="white" />
          <circle cx="560" cy="100" r="60" fill="white" />
          <path
            d="M0 80 Q200 20 400 80 Q500 110 600 60"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
        </svg>
        <div className={styles.bannerLeft}>
          <p className={styles.bannerSubtitle}>Chào buổi sáng 👋</p>
          <h2 className={styles.bannerTitle}>Tổng quan hệ thống hôm nay</h2>
          <p className={styles.bannerDate}>
            Thứ 4, 04/03/2026 · 5 lớp học đang diễn ra
          </p>
        </div>
        <div className={styles.bannerAction}>
          <div className={styles.bannerActionBtn}>📊 Xem báo cáo tháng</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Học viên đang học"
          value={STATS.totalActiveStudents}
          sub="Học viên tích cực"
          icon={Users}
          trend={STATS.totalStudentsTrend}
          trendLabel="so tháng trước"
          accent="#E02020"
        />
        <StatCard
          label="Huấn luyện viên"
          value={STATS.activeCoaches}
          sub="4 đang hoạt động"
          icon={UserCheck}
          trend={STATS.coachesTrend}
          trendLabel="không thay đổi"
          accent="#7C3AED"
        />
        <StatCard
          label="Lớp học hôm nay"
          value={STATS.classesToday}
          sub="Trên 3 phòng tập"
          icon={CalendarDays}
          trend={STATS.classesTrend}
          trendLabel="so hôm qua"
          accent="#0284C7"
        />
        <StatCard
          label="Doanh thu tháng"
          value="128.5M"
          sub="VND"
          icon={DollarSign}
          trend={STATS.revenueTrend}
          trendLabel="% so tháng trước"
          accent="#059669"
        />
      </div>

      {/* Charts row */}
      <div className={styles.chartsGrid}>
        {/* Enrollment trend */}
        <div className={`${styles.chartCard} ${styles.chartCardWide}`}>
          <div className={styles.chartHead}>
            <div>
              <h3
                style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}
              >
                Tăng trưởng học viên
              </h3>
              <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
                7 tháng gần nhất
              </p>
            </div>
            <span className={styles.chartBadge}>
              +{STATS.totalStudentsTrend} HV
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={MONTHLY_ENROLLMENT}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E02020" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#E02020" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                domain={[50, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="students"
                name="students"
                stroke="#E02020"
                strokeWidth={2.5}
                fill="url(#redGrad)"
                dot={{ fill: "#E02020", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#E02020" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance rate bar */}
        <div className={styles.chartCard}>
          <div className={styles.chartSubHead}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
              Tỷ lệ điểm danh
            </h3>
            <p style={{ fontSize: "12px", color: "#9CA3AF" }}>Tuần này (%)</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={ATTENDANCE_RATE}
              margin={{ top: 5, right: 0, left: -25, bottom: 0 }}
              barSize={20}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F3F4F6"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="rate"
                name="rate"
                fill="#E02020"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: Recent enrollments + Today classes */}
      <div className={styles.bottomGrid}>
        {/* Recent Activity – StudentEnrollmentResDTO */}
        <div className={styles.recentCard}>
          <div className={styles.cardHead}>
            <div>
              <h3
                style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}
              >
                Đăng ký gần đây
              </h3>
              <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
                Danh sách StudentEnrollmentResDTO
              </p>
            </div>
            <button className={styles.viewAllBtn}>
              Xem tất cả <ArrowRight size={12} />
            </button>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr style={{ background: "#FAFAFA" }}>
                  {[
                    "Học viên",
                    "Lớp học",
                    "HLV",
                    "Ngày đăng ký",
                    "Trạng thái",
                    "Học phí",
                  ].map((h) => (
                    <th
                      key={h}
                      className={styles.th}
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9CA3AF",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ENROLLMENTS.map((e) => (
                  <tr key={e.enrollmentId} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.avatarCell}>
                        <div
                          className={styles.avatar}
                          style={{
                            background: avatarColor(e.studentAvatar),
                            fontSize: "10px",
                            fontWeight: 700,
                          }}
                        >
                          {e.studentAvatar}
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#111827",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {e.studentName}
                          </p>
                          <p style={{ fontSize: "11px", color: "#9CA3AF" }}>
                            {e.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "#374151",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {e.className}
                      </p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF" }}>
                        {e.classCode}
                      </p>
                    </td>
                    <td className={styles.td}>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#374151",
                          whiteSpace: "nowrap",
                        }}
                      ></p>
                    </td>
                    <td className={styles.td}>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#374151",
                          whiteSpace: "nowrap",
                        }}
                      ></p>
                    </td>
                    <td className={styles.td}>
                      <StatusBadge status={e.status} />
                    </td>
                    <td className={styles.td}>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#111827",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {e.fee.toLocaleString("vi-VN")}₫
                      </p>
                      <PayBadge status={e.paymentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's classes */}
        <div className={styles.todayCard}>
          <div className={styles.cardSimpleHead}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
              Lớp học hôm nay
            </h3>
            <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
              Thứ 4, 04/03/2026
            </p>
          </div>
          <div className={styles.cardBody}>
            {CLASSES.filter((c) => c.dayOfWeek.includes("Thứ 4")).map((cls) => (
              <div key={cls.classId} className={styles.classItem}>
                <div className={styles.classItemHead}>
                  <div>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {cls.className}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#9CA3AF",
                        marginTop: "2px",
                      }}
                    >
                      {cls.coach}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      flexShrink: 0,
                      background:
                        cls.level === "beginner"
                          ? "#D1FAE5"
                          : cls.level === "intermediate"
                            ? "#FEF3C7"
                            : cls.level === "advanced"
                              ? "#FEE2E2"
                              : "#E0E7FF",
                      color:
                        cls.level === "beginner"
                          ? "#065F46"
                          : cls.level === "intermediate"
                            ? "#92400E"
                            : cls.level === "advanced"
                              ? "#991B1B"
                              : "#3730A3",
                      fontSize: "10px",
                      fontWeight: 600,
                    }}
                  >
                    {cls.level === "beginner"
                      ? "Cơ bản"
                      : cls.level === "intermediate"
                        ? "Nâng cao"
                        : cls.level === "advanced"
                          ? "Cao cấp"
                          : "Tất cả"}
                  </span>
                </div>
                <div className={styles.classTimeRow}>
                  <div className={styles.timeInfo}>
                    <Clock size={11} />
                    <span style={{ fontSize: "11px" }}>{cls.time}</span>
                  </div>
                  <div className={styles.timeInfo}>
                    <Users size={11} />
                    <span style={{ fontSize: "11px" }}>
                      {cls.enrolled}/{cls.capacity}
                    </span>
                  </div>
                </div>
                {/* capacity bar */}
                <div className={styles.capacityBar}>
                  <div
                    className={styles.capacityFill}
                    style={{
                      width: `${(cls.enrolled / cls.capacity) * 100}%`,
                      background:
                        cls.enrolled / cls.capacity > 0.8
                          ? "#E02020"
                          : "#10B981",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// suppress unused variable warning for todayClasses
void todayClasses;
