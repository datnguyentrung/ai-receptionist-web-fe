import type { StudentDTO } from "@/data/mockData";
import { MoreHorizontal, Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import { STUDENTS } from "../../data/mockData";

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

const BELT_COLORS: Record<string, { bg: string; color: string }> = {
  "Đai Trắng": { bg: "#F9FAFB", color: "#374151" },
  "Đai Vàng": { bg: "#FEF9C3", color: "#854D0E" },
  "Đai Xanh Lá": { bg: "#DCFCE7", color: "#166534" },
  "Đai Xanh Lam": { bg: "#DBEAFE", color: "#1E40AF" },
  "Đai Đỏ": { bg: "#FEE2E2", color: "#991B1B" },
  "Đai Đen 1 Đẳng": { bg: "#1F2937", color: "#F9FAFB" },
};

function StatusBadge({ status }: { status: StudentDTO["status"] }) {
  const map = {
    active: {
      label: "Đang học",
      bg: "#D1FAE5",
      color: "#065F46",
      dot: "#10B981",
    },
    inactive: {
      label: "Tạm nghỉ",
      bg: "#FEE2E2",
      color: "#991B1B",
      dot: "#EF4444",
    },
    graduated: {
      label: "Tốt nghiệp",
      bg: "#E0E7FF",
      color: "#3730A3",
      dot: "#6366F1",
    },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full"
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

export function StudentManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | StudentDTO["status"]
  >("all");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = STUDENTS.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.enrolledClass.toLowerCase().includes(search.toLowerCase()) ||
      s.coach.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div
      className="space-y-5"
      style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
            Quản lý Học Viên
          </h2>
          <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
            {STUDENTS.length} học viên ·{" "}
            {STUDENTS.filter((s) => s.status === "active").length} đang học
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
          <Plus size={16} /> Thêm học viên
        </button>
      </div>

      {/* Summary mini cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tổng học viên", value: STUDENTS.length, color: "#E02020" },
          {
            label: "Đang học",
            value: STUDENTS.filter((s) => s.status === "active").length,
            color: "#10B981",
          },
          {
            label: "Tạm nghỉ",
            value: STUDENTS.filter((s) => s.status === "inactive").length,
            color: "#F59E0B",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-2xl p-4 border text-center"
            style={{ borderColor: "#F0F0F5" }}
          >
            <p style={{ fontSize: "22px", fontWeight: 800, color: c.color }}>
              {c.value}
            </p>
            <p style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500 }}>
              {c.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white"
          style={{ borderColor: "#E8EBF0", width: "260px" }}
        >
          <Search size={14} style={{ color: "#9CA3AF" }} />
          <input
            className="flex-1 outline-none bg-transparent"
            placeholder="Tìm học viên, lớp, HLV..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: "13px", color: "#374151" }}
          />
        </div>
        {(["all", "active", "inactive", "graduated"] as const).map((f) => (
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
              : f === "active"
                ? "Đang học"
                : f === "inactive"
                  ? "Tạm nghỉ"
                  : "Tốt nghiệp"}
          </button>
        ))}
        {selected.length > 0 && (
          <span
            className="ml-auto px-3 py-2 rounded-xl text-white"
            style={{ background: "#E02020", fontSize: "12px", fontWeight: 600 }}
          >
            Đã chọn {selected.length}
          </span>
        )}
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
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    className="rounded"
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? filtered.map((s) => s.studentId)
                          : [],
                      )
                    }
                    checked={
                      selected.length === filtered.length && filtered.length > 0
                    }
                  />
                </th>
                {[
                  "Học viên",
                  "Liên hệ",
                  "Lớp học",
                  "Huấn luyện viên",
                  "Cấp đai",
                  "Ngày vào học",
                  "Trạng thái",
                  "",
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
              {filtered.map((student) => (
                <tr
                  key={student.studentId}
                  className="border-t hover:bg-gray-50/60 transition"
                  style={{ borderColor: "#F3F4F6" }}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selected.includes(student.studentId)}
                      onChange={() => toggleSelect(student.studentId)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{
                          background: avatarColor(student.avatar),
                          fontSize: "10px",
                          fontWeight: 800,
                        }}
                      >
                        {student.avatar}
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#111827",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {student.name}
                        </p>
                        <p style={{ fontSize: "11px", color: "#9CA3AF" }}>
                          {student.studentId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: "12px", color: "#374151" }}>
                      {student.phone}
                    </p>
                    <p style={{ fontSize: "11px", color: "#9CA3AF" }}>
                      {student.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#374151",
                        whiteSpace: "nowrap",
                        maxWidth: "160px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {student.enrolledClass}
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
                      {student.coach}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2.5 py-1 rounded-full"
                      style={{
                        background: BELT_COLORS[student.belt]?.bg ?? "#F3F4F6",
                        color: BELT_COLORS[student.belt]?.color ?? "#374151",
                        fontSize: "11px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {student.belt}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#374151",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(student.enrollDate).toLocaleDateString("vi-VN")}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                      <MoreHorizontal size={15} style={{ color: "#9CA3AF" }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users
              size={36}
              style={{ color: "#D1D5DB", margin: "0 auto 8px" }}
            />
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
              Không tìm thấy học viên nào
            </p>
          </div>
        )}
        <div
          className="flex items-center justify-between px-5 py-3 border-t"
          style={{ borderColor: "#F3F4F6" }}
        >
          <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
            Hiển thị {filtered.length} / {STUDENTS.length} học viên
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition"
                style={{
                  background: p === 1 ? "#E02020" : "transparent",
                  color: p === 1 ? "white" : "#6B7280",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
