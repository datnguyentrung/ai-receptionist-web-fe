import type { ClassScheduleDTO } from "@/data/mockData";
import styles from "./ClassBadges.module.scss";

export function LevelBadge({ level }: { level: ClassScheduleDTO["level"] }) {
  const map = {
    beginner: { label: "Cơ bản", bg: "#D1FAE5", color: "#065F46" },
    intermediate: { label: "Nâng cao", bg: "#FEF3C7", color: "#92400E" },
    advanced: { label: "Cao cấp", bg: "#FEE2E2", color: "#991B1B" },
    all: { label: "Tất cả", bg: "#E0E7FF", color: "#3730A3" },
  };
  const s = map[level];
  return (
    <span className={styles.badge} style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export function StatusBadge({
  status,
}: {
  status: ClassScheduleDTO["status"];
}) {
  const map = {
    ongoing: { label: "Đang mở", bg: "#D1FAE5", color: "#065F46" },
    upcoming: { label: "Sắp khai giảng", bg: "#FEF3C7", color: "#92400E" },
    completed: { label: "Đã kết thúc", bg: "#F3F4F6", color: "#6B7280" },
  };
  const s = map[status];
  return (
    <span className={styles.badge} style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}
