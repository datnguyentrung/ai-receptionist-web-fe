import type { CoachStatus } from "../../../../config/constants";
import styles from "./StatusBadge.module.scss";

export default function StatusBadge({ status }: { status: CoachStatus }) {
  const map: Record<
    CoachStatus,
    { label: string; bg: string; color: string; dot: string }
  > = {
    ACTIVE: {
      label: "Đang hoạt động",
      bg: "#D1FAE5",
      color: "#065F46",
      dot: "#10B981",
    },
    INACTIVE: {
      label: "Tạm nghỉ",
      bg: "#F3F4F6",
      color: "#6B7280",
      dot: "#9CA3AF",
    },
    SUSPENDED: {
      label: "Đình chỉ",
      bg: "#FEF3C7",
      color: "#92400E",
      dot: "#F59E0B",
    },
    RETIRED: {
      label: "Đã nghỉ hưu",
      bg: "#EDE9FE",
      color: "#5B21B6",
      dot: "#7C3AED",
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
