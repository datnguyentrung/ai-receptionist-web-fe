import type { StudentStatus } from "../../../../config/constants";
import styles from "./StatusBadge.module.scss";

const STATUS_MAP: Record<
  StudentStatus,
  { label: string; bg: string; color: string; dot: string }
> = {
  ACTIVE: {
    label: "Đang học",
    bg: "#D1FAE5",
    color: "#065F46",
    dot: "#10B981",
  },
  RESERVED: {
    label: "Tạm nghỉ",
    bg: "#FEE2E2",
    color: "#991B1B",
    dot: "#EF4444",
  },
  DROPPED: {
    label: "Nghỉ học",
    bg: "#E0E7FF",
    color: "#3730A3",
    dot: "#6366F1",
  },
};

export default function StatusBadge({ status }: { status: StudentStatus }) {
  const s = STATUS_MAP[status];
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
