import type { ClassScheduleDTO } from "@/data/mockData";
import {
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { CLASSES } from "../../data/mockData";

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];

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

function LevelBadge({ level }: { level: ClassScheduleDTO["level"] }) {
  const map = {
    beginner: { label: "Cơ bản", bg: "#D1FAE5", color: "#065F46" },
    intermediate: { label: "Nâng cao", bg: "#FEF3C7", color: "#92400E" },
    advanced: { label: "Cao cấp", bg: "#FEE2E2", color: "#991B1B" },
    all: { label: "Tất cả", bg: "#E0E7FF", color: "#3730A3" },
  };
  const s = map[level];
  return (
    <span
      className="px-2 py-0.5 rounded-full"
      style={{
        background: s.bg,
        color: s.color,
        fontSize: "10px",
        fontWeight: 700,
      }}
    >
      {s.label}
    </span>
  );
}

function StatusBadge({ status }: { status: ClassScheduleDTO["status"] }) {
  const map = {
    ongoing: { label: "Đang mở", bg: "#D1FAE5", color: "#065F46" },
    upcoming: { label: "Sắp khai giảng", bg: "#FEF3C7", color: "#92400E" },
    completed: { label: "Đã kết thúc", bg: "#F3F4F6", color: "#6B7280" },
  };
  const s = map[status];
  return (
    <span
      className="px-2.5 py-1 rounded-full"
      style={{
        background: s.bg,
        color: s.color,
        fontSize: "11px",
        fontWeight: 600,
      }}
    >
      {s.label}
    </span>
  );
}

export function ClassSchedules() {
  const [view, setView] = useState<"grid" | "week">("grid");
  const [selectedDay, setSelectedDay] = useState("Thứ 4");

  return (
    <div
      className="space-y-5"
      style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
            Lịch Học
          </h2>
          <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
            {CLASSES.length} lớp ·{" "}
            {CLASSES.filter((c) => c.status === "ongoing").length} đang hoạt
            động
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div
            className="flex items-center rounded-xl border bg-white p-1 gap-1"
            style={{ borderColor: "#E8EBF0" }}
          >
            {(["grid", "week"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-1.5 rounded-lg transition"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  background: view === v ? "#E02020" : "transparent",
                  color: view === v ? "white" : "#6B7280",
                }}
              >
                {v === "grid" ? "Thẻ lớp" : "Theo ngày"}
              </button>
            ))}
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
            <Plus size={16} /> Tạo lớp mới
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {CLASSES.map((cls) => (
            <div
              key={cls.classId}
              className="bg-white rounded-2xl border overflow-hidden hover:shadow-md transition group cursor-pointer"
              style={{ borderColor: "#F0F0F5" }}
            >
              {/* Color accent */}
              <div
                className="h-1.5"
                style={{
                  background:
                    cls.status === "ongoing"
                      ? "linear-gradient(90deg,#E02020,#7b0000)"
                      : cls.status === "upcoming"
                        ? "linear-gradient(90deg,#F59E0B,#D97706)"
                        : "#E5E7EB",
                }}
              />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
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
                      {cls.classCode}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <LevelBadge level={cls.level} />
                    <StatusBadge status={cls.status} />
                  </div>
                </div>

                {/* Coach */}
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                    style={{
                      background: avatarColor(cls.coachAvatar),
                      fontSize: "9px",
                      fontWeight: 800,
                    }}
                  >
                    {cls.coachAvatar}
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#374151",
                      fontWeight: 500,
                    }}
                  >
                    {cls.coach}
                  </span>
                </div>

                {/* Info rows */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock size={13} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "12px" }}>
                      {cls.time} ({cls.duration} phút)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar size={13} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "12px" }}>
                      {cls.dayOfWeek.join(" · ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin size={13} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "12px" }}>{cls.room}</span>
                  </div>
                </div>

                {/* Capacity */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users size={12} />
                      <span style={{ fontSize: "11px" }}>Sĩ số</span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color:
                          cls.enrolled / cls.capacity > 0.8
                            ? "#E02020"
                            : "#111827",
                      }}
                    >
                      {cls.enrolled}/{cls.capacity}
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "#F3F4F6" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(cls.enrolled / cls.capacity) * 100}%`,
                        background:
                          cls.enrolled / cls.capacity > 0.8
                            ? "#E02020"
                            : cls.enrolled / cls.capacity > 0.5
                              ? "#F59E0B"
                              : "#10B981",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Week view */
        <div className="space-y-4">
          {/* Day pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {DAYS.map((day) => {
              const count = CLASSES.filter((c) =>
                c.dayOfWeek.includes(day),
              ).length;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className="flex flex-col items-center px-4 py-3 rounded-2xl border transition flex-shrink-0"
                  style={{
                    borderColor: selectedDay === day ? "#E02020" : "#E8EBF0",
                    background: selectedDay === day ? "#E02020" : "white",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: selectedDay === day ? "white" : "#374151",
                    }}
                  >
                    {day}
                  </span>
                  <span
                    className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        selectedDay === day
                          ? "rgba(255,255,255,0.2)"
                          : "#F3F4F6",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: selectedDay === day ? "white" : "#9CA3AF",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Classes for selected day */}
          <div className="space-y-3">
            {CLASSES.filter((c) => c.dayOfWeek.includes(selectedDay)).length ===
            0 ? (
              <div
                className="text-center py-16 bg-white rounded-2xl border"
                style={{ borderColor: "#F0F0F5" }}
              >
                <Calendar
                  size={40}
                  style={{ color: "#D1D5DB", margin: "0 auto 12px" }}
                />
                <p style={{ fontSize: "14px", color: "#9CA3AF" }}>
                  Không có lớp học vào {selectedDay}
                </p>
              </div>
            ) : (
              CLASSES.filter((c) => c.dayOfWeek.includes(selectedDay)).map(
                (cls) => (
                  <div
                    key={cls.classId}
                    className="bg-white rounded-2xl border p-4 flex items-center gap-4 hover:shadow-sm transition"
                    style={{ borderColor: "#F0F0F5" }}
                  >
                    {/* Time block */}
                    <div
                      className="flex-shrink-0 w-20 text-center p-2 rounded-xl"
                      style={{ background: "#FEF2F2" }}
                    >
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#E02020",
                        }}
                      >
                        {cls.time.split(" - ")[0]}
                      </p>
                      <p style={{ fontSize: "10px", color: "#9CA3AF" }}>
                        {cls.duration}p
                      </p>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#111827",
                          }}
                        >
                          {cls.className}
                        </p>
                        <LevelBadge level={cls.level} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span
                          className="flex items-center gap-1 text-gray-400"
                          style={{ fontSize: "11px" }}
                        >
                          <Users size={11} /> {cls.enrolled}/{cls.capacity} HV
                        </span>
                        <span
                          className="flex items-center gap-1 text-gray-400"
                          style={{ fontSize: "11px" }}
                        >
                          <MapPin size={11} /> {cls.room}
                        </span>
                        <span
                          className="flex items-center gap-1 text-gray-400"
                          style={{ fontSize: "11px" }}
                        >
                          HLV: {cls.coach}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={cls.status} />
                    <ChevronRight
                      size={16}
                      style={{ color: "#D1D5DB", flexShrink: 0 }}
                    />
                  </div>
                ),
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
