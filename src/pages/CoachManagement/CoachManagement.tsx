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
import styles from "./CoachManagement.module.scss";

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
      className={styles.statusBadge}
      style={{ background: s.bg, color: s.color }}
    >
      <span className={styles.statusDot} style={{ background: s.dot }} />
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
    <div className={styles.page}>
      {/* Header row */}
      <div className={styles.pageHead}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
            Quản lý Huấn luyện viên
          </h2>
          <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
            {COACHES.length} huấn luyện viên ·{" "}
            {COACHES.filter((c) => c.status === "active").length} đang hoạt động
          </p>
        </div>
        <button className={styles.addBtn}>
          <Plus size={16} /> Thêm HLV mới
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox} style={{ width: "240px" }}>
          <Search size={14} style={{ color: "#9CA3AF" }} />
          <input
            className={styles.searchInput}
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
            className={styles.filterBtn}
            style={{
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
      <div className={styles.coachGrid}>
        {filtered.map((coach) => (
          <div key={coach.coachId} className={styles.coachCard}>
            {/* Card top bar */}
            <div
              className={styles.cardAccent}
              style={{
                background:
                  coach.status === "active"
                    ? "linear-gradient(90deg,#E02020,#7b0000)"
                    : "#E5E7EB",
              }}
            />
            <div className={styles.cardBody}>
              <div className={styles.cardTopRow}>
                <div className={styles.coachInfo}>
                  <div
                    className={styles.coachAvatar}
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
                <button className={styles.moreBtn}>
                  <MoreVertical size={15} style={{ color: "#9CA3AF" }} />
                </button>
              </div>

              <div className={styles.statusSection}>
                <StatusBadge status={coach.status} />
              </div>

              {/* Stats row */}
              <div className={styles.statsGrid}>
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
                  <div key={label} className={styles.statItem}>
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
              <div className={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={13}
                    fill={s <= Math.round(coach.rating) ? "#F59E0B" : "none"}
                    style={{ color: "#F59E0B" }}
                  />
                ))}
                <span className={styles.ratingValue}>
                  {coach.rating.toFixed(1)}
                </span>
              </div>

              {/* Contact */}
              <div className={styles.contactRow}>
                <a href={`tel:${coach.phone}`} className={styles.contactLink}>
                  <Phone size={13} />
                  <span style={{ fontSize: "11px" }}>{coach.phone}</span>
                </a>
                <a
                  href={`mailto:${coach.email}`}
                  className={styles.contactLinkRight}
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
        <div className={styles.emptyState}>
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
