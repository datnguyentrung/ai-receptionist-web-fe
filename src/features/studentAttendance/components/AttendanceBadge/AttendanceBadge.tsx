import type { AttendanceStatus } from "@/config/constants";
import { AttendanceStatusLabel } from "@/config/constants";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import styles from "./AttendanceBadge.module.scss";

const STATUS_MAP = {
  PRESENT: {
    label: "Có mặt",
    bg: "#D1FAE5",
    color: "#065F46",
    icon: CheckCircle2,
  },
  ABSENT: { label: "Vắng", bg: "#FEE2E2", color: "#991B1B", icon: XCircle },
  LATE: { label: "Đi muộn", bg: "#FEF3C7", color: "#92400E", icon: Clock },
  EXCUSED: {
    label: "Có phép",
    bg: "#E0E7FF",
    color: "#3730A3",
    icon: AlertCircle,
  },
  MAKEUP: {
    label: "Học bù",
    bg: "#F3F4F6",
    color: "#374151",
    icon: Clock,
  },
};

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP["ABSENT"];
  const Icon = s.icon;
  return (
    <span
      className={styles.statusBadge}
      style={{ background: s.bg, color: s.color }}
    >
      <Icon size={11} />
      {AttendanceStatusLabel[status]}
    </span>
  );
}
