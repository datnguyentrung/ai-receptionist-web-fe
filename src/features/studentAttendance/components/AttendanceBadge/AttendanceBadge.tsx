import type { AttendanceDTO } from "@/data/mockData";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import styles from "./AttendanceBadge.module.scss";

const STATUS_MAP = {
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

export function AttendanceBadge({
  status,
}: {
  status: AttendanceDTO["status"];
}) {
  const s = STATUS_MAP[status];
  const Icon = s.icon;
  return (
    <span
      className={styles.statusBadge}
      style={{ background: s.bg, color: s.color }}
    >
      <Icon size={11} />
      {s.label}
    </span>
  );
}
