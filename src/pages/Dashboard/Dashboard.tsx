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
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{
        background: s.bg,
        color: s.color,
        fontSize: "11px",
        fontWeight: 600,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: s.dot }}
      />
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
  icon: React.ComponentType<any>;
  trend?: number;
  trendLabel?: string;
  accent: string;
}) {
  const positive = (trend ?? 0) >= 0;
  return (
    <div
      className="bg-white rounded-2xl p-5 flex flex-col gap-4 border"
      style={{ borderColor: "#F0F0F5" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
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
            className="mt-1"
            style={{
              fontSize: "30px",
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.1,
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
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: accent + "15" }}
        >
          <Icon size={22} style={{ color: accent }} />
        </div>
      </div>
      {trend !== undefined && (
        <div
          className="flex items-center gap-1.5 pt-1 border-t"
          style={{ borderColor: "#F3F4F6" }}
        >
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
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-white border rounded-xl px-3 py-2 shadow-lg"
      style={{ borderColor: "#E5E7EB" }}
    >
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
    <div
      className="space-y-6"
      style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* Greeting banner */}
      <div
        className="rounded-2xl p-5 flex items-center justify-between overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #E02020 0%, #7b0000 100%)",
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
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
        <div className="relative z-10">
          <p className="text-white/80" style={{ fontSize: "13px" }}>
            Chào buổi sáng 👋
          </p>
          <h2
            className="text-white mt-0.5"
            style={{ fontSize: "20px", fontWeight: 700 }}
          >
            Tổng quan hệ thống hôm nay
          </h2>
          <p className="text-white/60 mt-1" style={{ fontSize: "12px" }}>
            Thứ 4, 04/03/2026 · 5 lớp học đang diễn ra
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 relative z-10">
          <div
            className="px-4 py-2 rounded-xl bg-white/15 border border-white/20 text-white"
            style={{ fontSize: "12px", fontWeight: 600 }}
          >
            📊 Xem báo cáo tháng
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Enrollment trend */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl p-5 border"
          style={{ borderColor: "#F0F0F5" }}
        >
          <div className="flex items-center justify-between mb-4">
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
            <span
              className="px-3 py-1 rounded-full text-white"
              style={{
                background: "#E02020",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
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
        <div
          className="bg-white rounded-2xl p-5 border"
          style={{ borderColor: "#F0F0F5" }}
        >
          <div className="mb-4">
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Activity – StudentEnrollmentResDTO */}
        <div
          className="xl:col-span-2 bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: "#F0F0F5" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "#F3F4F6" }}
          >
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
            <button
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl transition hover:bg-red-50"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#E02020",
                border: "1px solid #E02020",
              }}
            >
              Xem tất cả <ArrowRight size={12} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
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
                      className="text-left px-4 py-3"
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
                  <tr
                    key={e.enrollmentId}
                    className="border-t hover:bg-gray-50/60 transition"
                    style={{ borderColor: "#F3F4F6" }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
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
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3">
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#374151",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {e.coachName.replace("HLV ", "")}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#374151",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {new Date(e.enrollmentDate).toLocaleDateString("vi-VN")}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="px-4 py-3">
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
        <div
          className="bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: "#F0F0F5" }}
        >
          <div
            className="px-5 py-4 border-b"
            style={{ borderColor: "#F3F4F6" }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
              Lớp học hôm nay
            </h3>
            <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
              Thứ 4, 04/03/2026
            </p>
          </div>
          <div className="p-4 space-y-3">
            {CLASSES.filter((c) => c.dayOfWeek.includes("Thứ 4")).map(
              (cls, i) => (
                <div
                  key={cls.classId}
                  className="p-3 rounded-xl border hover:shadow-sm transition"
                  style={{ borderColor: "#F0F0F5" }}
                >
                  <div className="flex items-start justify-between gap-2">
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
                      className="px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
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
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock size={11} />
                      <span style={{ fontSize: "11px" }}>{cls.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Users size={11} />
                      <span style={{ fontSize: "11px" }}>
                        {cls.enrolled}/{cls.capacity}
                      </span>
                    </div>
                  </div>
                  {/* capacity bar */}
                  <div
                    className="mt-2 h-1 rounded-full overflow-hidden"
                    style={{ background: "#F3F4F6" }}
                  >
                    <div
                      className="h-full rounded-full"
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
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// suppress unused variable warning for todayClasses
void todayClasses;
