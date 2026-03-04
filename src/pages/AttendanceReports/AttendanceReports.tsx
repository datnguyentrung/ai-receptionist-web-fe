import type { AttendanceDTO } from "@/data/mockData";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ATTENDANCE } from "../../data/mockData";

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

function AttendanceBadge({ status }: { status: AttendanceDTO["status"] }) {
  const map = {
    present: {
      label: "Có mặt",
      bg: "#D1FAE5",
      color: "#065F46",
      icon: CheckCircle2,
    },
    absent: { label: "Vắng", bg: "#FEE2E2", color: "#991B1B", icon: XCircle },
    late: { label: "Đi muộn", bg: "#FEF3C7", color: "#92400E", icon: Clock },
    excused: {
      label: "Có phép",
      bg: "#E0E7FF",
      color: "#3730A3",
      icon: AlertCircle,
    },
  };
  const s = map[status];
  const Icon = s.icon;
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
      <Icon size={11} />
      {s.label}
    </span>
  );
}

const PIE_DATA = [
  { name: "Có mặt", value: 64, color: "#10B981" },
  { name: "Đi muộn", value: 18, color: "#F59E0B" },
  { name: "Có phép", value: 10, color: "#6366F1" },
  { name: "Vắng", value: 8, color: "#EF4444" },
];

const SUMMARY_CARDS = [
  {
    label: "Có mặt",
    value: "64%",
    icon: CheckCircle2,
    color: "#10B981",
    bg: "#D1FAE5",
  },
  {
    label: "Đi muộn",
    value: "18%",
    icon: Clock,
    color: "#F59E0B",
    bg: "#FEF3C7",
  },
  {
    label: "Có phép",
    value: "10%",
    icon: AlertCircle,
    color: "#6366F1",
    bg: "#E0E7FF",
  },
  {
    label: "Vắng mặt",
    value: "8%",
    icon: XCircle,
    color: "#EF4444",
    bg: "#FEE2E2",
  },
];

export function AttendanceReports() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | AttendanceDTO["status"]
  >("all");
  const [dateFilter, setDateFilter] = useState("");

  const filtered = ATTENDANCE.filter((a) => {
    const matchSearch =
      a.studentName.toLowerCase().includes(search.toLowerCase()) ||
      a.className.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchDate = !dateFilter || a.date === dateFilter;
    return matchSearch && matchStatus && matchDate;
  });

  return (
    <div
      className="space-y-5"
      style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
            Báo cáo Điểm Danh
          </h2>
          <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
            Tuần 10/2026 · {ATTENDANCE.length} bản ghi
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition hover:opacity-90 border"
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#E02020",
            borderColor: "#E02020",
            background: "white",
          }}
        >
          <Download size={16} /> Xuất báo cáo
        </button>
      </div>

      {/* Summary + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Summary mini cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SUMMARY_CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="bg-white rounded-2xl p-4 border flex flex-col gap-2"
                style={{ borderColor: "#F0F0F5" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: c.bg }}
                >
                  <Icon size={16} style={{ color: c.color }} />
                </div>
                <p
                  style={{ fontSize: "22px", fontWeight: 800, color: c.color }}
                >
                  {c.value}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#9CA3AF",
                    fontWeight: 500,
                  }}
                >
                  {c.label}
                </p>
              </div>
            );
          })}

          {/* Weekly trend note */}
          <div
            className="col-span-2 sm:col-span-4 bg-white rounded-2xl p-4 border flex items-center gap-3"
            style={{ borderColor: "#F0F0F5" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#FEF2F2" }}
            >
              <TrendingUp size={18} style={{ color: "#E02020" }} />
            </div>
            <div>
              <p
                style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}
              >
                Tỷ lệ có mặt tuần này: 82%
              </p>
              <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
                Tăng 3% so với tuần trước · Tổng 5 lớp học
              </p>
            </div>
            <div className="ml-auto hidden sm:block">
              <div className="flex gap-0.5">
                {[88, 82, 90, 78, 92, 85].map((v, i) => (
                  <div
                    key={i}
                    className="w-4 rounded-sm"
                    style={{
                      height: `${v * 0.4}px`,
                      background: i === 5 ? "#E02020" : "#FECACA",
                      alignSelf: "flex-end",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div
          className="bg-white rounded-2xl p-5 border"
          style={{ borderColor: "#F0F0F5" }}
        >
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "4px",
            }}
          >
            Phân bố điểm danh
          </p>
          <p
            style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "8px" }}
          >
            Tuần hiện tại
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={PIE_DATA}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {PIE_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, ""]} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "11px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white"
          style={{ borderColor: "#E8EBF0", width: "220px" }}
        >
          <Search size={14} style={{ color: "#9CA3AF" }} />
          <input
            className="flex-1 outline-none bg-transparent"
            placeholder="Tìm học viên, lớp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: "13px", color: "#374151" }}
          />
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white"
          style={{ borderColor: "#E8EBF0" }}
        >
          <Calendar size={14} style={{ color: "#9CA3AF" }} />
          <input
            type="date"
            className="outline-none bg-transparent"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ fontSize: "13px", color: "#374151" }}
          />
        </div>
        {(["all", "present", "absent", "late", "excused"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className="px-3 py-2 rounded-xl border transition"
            style={{
              fontSize: "12px",
              fontWeight: 600,
              borderColor: statusFilter === f ? "#E02020" : "#E8EBF0",
              background: statusFilter === f ? "#E02020" : "white",
              color: statusFilter === f ? "white" : "#6B7280",
            }}
          >
            {f === "all"
              ? "Tất cả"
              : f === "present"
                ? "Có mặt"
                : f === "absent"
                  ? "Vắng"
                  : f === "late"
                    ? "Đi muộn"
                    : "Có phép"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: "#F0F0F5" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                style={{
                  background: "#FAFAFA",
                  borderBottom: "1px solid #F3F4F6",
                }}
              >
                {[
                  "Học viên",
                  "Lớp học",
                  "Huấn luyện viên",
                  "Ngày",
                  "Giờ vào",
                  "Giờ ra",
                  "Trạng thái",
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
              {filtered.map((a) => (
                <tr
                  key={a.attendanceId}
                  className="border-t hover:bg-gray-50/60 transition"
                  style={{ borderColor: "#F3F4F6" }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{
                          background: avatarColor(a.studentAvatar),
                          fontSize: "9px",
                          fontWeight: 800,
                        }}
                      >
                        {a.studentAvatar}
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#111827",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {a.studentName}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#374151",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.className}
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
                      {a.coachName}
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
                      {new Date(a.date).toLocaleDateString("vi-VN")}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p
                      style={{
                        fontSize: "12px",
                        color: a.checkIn !== "-" ? "#111827" : "#D1D5DB",
                        fontWeight: a.checkIn !== "-" ? 500 : 400,
                      }}
                    >
                      {a.checkIn}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p
                      style={{
                        fontSize: "12px",
                        color: a.checkOut !== "-" ? "#111827" : "#D1D5DB",
                        fontWeight: a.checkOut !== "-" ? 500 : 400,
                      }}
                    >
                      {a.checkOut}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <AttendanceBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList
              size={36}
              style={{ color: "#D1D5DB", margin: "0 auto 8px" }}
            />
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
              Không có dữ liệu điểm danh
            </p>
          </div>
        )}
        <div
          className="flex items-center justify-between px-5 py-3 border-t"
          style={{ borderColor: "#F3F4F6" }}
        >
          <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
            Hiển thị {filtered.length} / {ATTENDANCE.length} bản ghi
          </p>
        </div>
      </div>
    </div>
  );
}

function ClipboardList({
  size,
  style,
}: {
  size: number;
  style: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="15" y2="16" />
      <line x1="9" y1="8" x2="10" y2="8" />
    </svg>
  );
}
