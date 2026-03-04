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
import styles from "./ClassSchedules.module.scss";

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
      className={styles.badge}
      style={{
        background: s.bg,
        color: s.color,
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
      className={styles.badge}
      style={{
        background: s.bg,
        color: s.color,
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
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHead}>
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
        <div className={styles.headerActions}>
          {/* View toggle */}
          <div className={styles.viewToggle}>
            {(["grid", "week"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={styles.viewToggleBtn}
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
          <button className={styles.addBtn}>
            <Plus size={16} /> Tạo lớp mới
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className={styles.cardsGrid}>
          {CLASSES.map((cls) => (
            <div key={cls.classId} className={styles.classCard}>
              {/* Color accent */}
              <div
                className={styles.cardAccent}
                style={{
                  background:
                    cls.status === "ongoing"
                      ? "linear-gradient(90deg,#E02020,#7b0000)"
                      : cls.status === "upcoming"
                        ? "linear-gradient(90deg,#F59E0B,#D97706)"
                        : "#E5E7EB",
                }}
              />
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
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
                  <div className={styles.cardBadges}>
                    <LevelBadge level={cls.level} />
                    <StatusBadge status={cls.status} />
                  </div>
                </div>

                {/* Coach */}
                <div className={styles.coachRow}>
                  <div
                    className={styles.coachAvatar}
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
                <div className={styles.infoRows}>
                  <div className={styles.infoRow}>
                    <Clock size={13} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "12px" }}>
                      {cls.time} ({cls.duration} phút)
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <Calendar size={13} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "12px" }}>
                      {cls.dayOfWeek.join(" · ")}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <MapPin size={13} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "12px" }}>{cls.room}</span>
                  </div>
                </div>

                {/* Capacity */}
                <div className={styles.capacitySection}>
                  <div className={styles.capacityHeader}>
                    <div className={styles.capacityUsers}>
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
                  <div className={styles.capacityBar}>
                    <div
                      className={styles.capacityFill}
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
        <div className={styles.weekView}>
          {/* Day pills */}
          <div className={styles.dayPills}>
            {DAYS.map((day) => {
              const count = CLASSES.filter((c) =>
                c.dayOfWeek.includes(day),
              ).length;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={styles.dayPill}
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
                    className={styles.dayPillCount}
                    style={{
                      background:
                        selectedDay === day
                          ? "rgba(255,255,255,0.2)"
                          : "#F3F4F6",
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
          <div className={styles.classList}>
            {CLASSES.filter((c) => c.dayOfWeek.includes(selectedDay)).length ===
            0 ? (
              <div className={styles.emptyState}>
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
                  <div key={cls.classId} className={styles.weekClassItem}>
                    {/* Time block */}
                    <div className={styles.timeBlock}>
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
                    <div className={styles.weekClassInfo}>
                      <div className={styles.weekClassTitleRow}>
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
                      <div className={styles.weekClassMetaRow}>
                        <span className={styles.metaItem}>
                          <Users size={11} /> {cls.enrolled}/{cls.capacity} HV
                        </span>
                        <span className={styles.metaItem}>
                          <MapPin size={11} /> {cls.room}
                        </span>
                        <span className={styles.metaItem}>
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
