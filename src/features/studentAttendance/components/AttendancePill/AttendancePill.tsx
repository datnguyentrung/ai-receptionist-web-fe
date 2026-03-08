import type { AttendanceStatus } from "@/config/constants";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import styles from "./AttendancePill.module.scss";

const ATTENDANCE_OPTIONS: {
  value: AttendanceStatus;
  label: string;
  short: string;
  activeBg: string;
  icon: React.ComponentType<{ size: number }>;
}[] = [
  {
    value: "PRESENT",
    label: "Có mặt",
    short: "✓",
    activeBg: "#16A34A",
    icon: CheckCircle2,
  },
  {
    value: "ABSENT",
    label: "Vắng",
    short: "✗",
    activeBg: "#E02020",
    icon: XCircle,
  },
  {
    value: "EXCUSED",
    label: "Có phép",
    short: "~",
    activeBg: "#D97706",
    icon: AlertCircle,
  },
];

interface AttendancePillProps {
  value: AttendanceStatus | null;
  onChange: (v: AttendanceStatus | null) => void;
}

export function AttendancePill({ value, onChange }: AttendancePillProps) {
  return (
    <div className={styles.pillContainer}>
      {ATTENDANCE_OPTIONS.map((opt) => {
        const active = value === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(active ? null : opt.value)}
            className={`${styles.pillBtn} ${active ? styles.active : ""}`}
            style={active ? { background: opt.activeBg } : undefined}
          >
            <Icon size={11} />
            <span className={styles.pillLabelFull}>{opt.label}</span>
            <span className={styles.pillLabelShort}>{opt.short}</span>
          </button>
        );
      })}
    </div>
  );
}
