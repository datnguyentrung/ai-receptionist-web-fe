import type { CoachDTO } from "@/data/mockData";
import {
  Award,
  BookOpen,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { COACHES } from "../../data/mockData";

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

function StatusBadge({ status }: { status: CoachDTO["status"] }) {
  const map = {
    active: {
      label: "Đang hoạt động",
      bg: "#D1FAE5",
      color: "#065F46",
      dot: "#10B981",
    },
    inactive: {
      label: "Tạm nghỉ",
      bg: "#F3F4F6",
      color: "#6B7280",
      dot: "#9CA3AF",
    },
    "on-leave": {
      label: "Nghỉ phép",
      bg: "#FEF3C7",
      color: "#92400E",
      dot: "#F59E0B",
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

export function CoachManagement() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | CoachDTO["status"]>("all");

  const filtered = COACHES.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.specialty.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div
      className="space-y-5"
      style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
            Quản lý Huấn luyện viên
          </h2>
          <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
            {COACHES.length} huấn luyện viên ·{" "}
            {COACHES.filter((c) => c.status === "active").length} đang hoạt động
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white transition hover:opacity-90"
          style={{
            background: "linear-gradient(135deg,#E02020,#7b0000)",
            fontSize: "13px",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(224,32,32,0.35)",
          }}
        >
          <Plus size={16} /> Thêm HLV mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white"
          style={{ borderColor: "#E8EBF0", width: "240px" }}
        >
          <Search size={14} style={{ color: "#9CA3AF" }} />
          <input
            className="flex-1 outline-none bg-transparent"
            placeholder="Tìm huấn luyện viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: "13px", color: "#374151" }}
          />
        </div>
        {(["all", "active", "on-leave", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-2 rounded-xl border transition"
            style={{
              fontSize: "12px",
              fontWeight: 600,
              borderColor: filter === f ? "#E02020" : "#E8EBF0",
              background: filter === f ? "#E02020" : "white",
              color: filter === f ? "white" : "#6B7280",
            }}
          >
            {f === "all"
              ? "Tất cả"
              : f === "active"
                ? "Đang hoạt động"
                : f === "on-leave"
                  ? "Nghỉ phép"
                  : "Tạm nghỉ"}
          </button>
        ))}
      </div>

      {/* Coach cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((coach) => (
          <div
            key={coach.coachId}
            className="bg-white rounded-2xl border overflow-hidden hover:shadow-md transition group"
            style={{ borderColor: "#F0F0F5" }}
          >
            {/* Card top bar */}
            <div
              className="h-2"
              style={{
                background:
                  coach.status === "active"
                    ? "linear-gradient(90deg,#E02020,#7b0000)"
                    : "#E5E7EB",
              }}
            />
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                    style={{
                      background: avatarColor(coach.avatar),
                      fontSize: "13px",
                      fontWeight: 800,
                    }}
                  >
                    {coach.avatar}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {coach.name}
                    </p>
                    <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
                      {coach.specialty}
                    </p>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg hover:bg-gray-100">
                  <MoreVertical size={15} style={{ color: "#9CA3AF" }} />
                </button>
              </div>

              <div className="mt-3">
                <StatusBadge status={coach.status} />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  {
                    icon: Users,
                    value: coach.activeStudents,
                    label: "Học viên",
                  },
                  {
                    icon: BookOpen,
                    value: coach.activeClasses,
                    label: "Lớp học",
                  },
                  {
                    icon: Award,
                    value: `${coach.experience}n`,
                    label: "Kinh nghiệm",
                  },
                ].map(({ icon: Icon, value, label }) => (
                  <div
                    key={label}
                    className="text-center p-2 rounded-xl"
                    style={{ background: "#F8F9FC" }}
                  >
                    <Icon
                      size={14}
                      style={{ color: "#E02020", margin: "0 auto 2px" }}
                    />
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {value}
                    </p>
                    <p style={{ fontSize: "10px", color: "#9CA3AF" }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={13}
                    fill={s <= Math.round(coach.rating) ? "#F59E0B" : "none"}
                    style={{ color: "#F59E0B" }}
                  />
                ))}
                <span
                  className="ml-1"
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#374151",
                  }}
                >
                  {coach.rating.toFixed(1)}
                </span>
              </div>

              {/* Contact */}
              <div
                className="flex items-center gap-3 mt-4 pt-3 border-t"
                style={{ borderColor: "#F3F4F6" }}
              >
                <a
                  href={`tel:${coach.phone}`}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-red-600 transition"
                >
                  <Phone size={13} />
                  <span style={{ fontSize: "11px" }}>{coach.phone}</span>
                </a>
                <a
                  href={`mailto:${coach.email}`}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-red-600 transition ml-auto"
                >
                  <Mail size={13} />
                  <span
                    style={{
                      fontSize: "11px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "130px",
                    }}
                  >
                    {coach.email}
                  </span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div
          className="text-center py-16 bg-white rounded-2xl border"
          style={{ borderColor: "#F0F0F5" }}
        >
          <Users
            size={40}
            style={{ color: "#D1D5DB", margin: "0 auto 12px" }}
          />
          <p style={{ fontSize: "14px", color: "#9CA3AF" }}>
            Không tìm thấy huấn luyện viên
          </p>
        </div>
      )}
    </div>
  );
}
