import type { AttendanceStatus } from "@/config/constants/OperationEnums";
import type { AttendanceStats } from "@/types";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import styles from "./SummaryStatCards.module.scss";

interface SummaryStatProps {
  stats: AttendanceStats;
  activeAttendanceStatuses?: AttendanceStatus[];
  onAttendanceFilterChange?: (value: AttendanceStatus[] | null) => void;
}

export function SummaryStatCards({
  stats,
  activeAttendanceStatuses,
  onAttendanceFilterChange,
}: SummaryStatProps) {
  const presentWithMakeup = stats.presentCount + stats.makeupCount;

  const summaryCards = [
    {
      label: "Có mặt",
      icon: CheckCircle2,
      color: "#10B981",
      bg: "#D1FAE5",
      value: presentWithMakeup,
      statuses: ["PRESENT", "MAKEUP"] as AttendanceStatus[],
    },
    {
      label: "Đi muộn",
      icon: Clock,
      color: "#F59E0B",
      bg: "#FEF3C7",
      value: stats.lateCount,
      statuses: ["LATE"] as AttendanceStatus[],
    },
    {
      label: "Có phép",
      icon: AlertCircle,
      color: "#6366F1",
      bg: "#E0E7FF",
      value: stats.excusedCount,
      statuses: ["EXCUSED"] as AttendanceStatus[],
    },
    {
      label: "Vắng mặt",
      icon: XCircle,
      color: "#EF4444",
      bg: "#FEE2E2",
      value: stats.absentCount,
      statuses: ["ABSENT"] as AttendanceStatus[],
    },
  ];

  return (
    <>
      {summaryCards.map((c) => {
        const Icon = c.icon;
        const isActive =
          activeAttendanceStatuses?.length === c.statuses.length &&
          c.statuses.every((status) =>
            activeAttendanceStatuses.includes(status),
          );
        return (
          <button
            key={c.label}
            type="button"
            className={`${styles.summaryCard} ${isActive ? styles.summaryCardActive : ""}`}
            onClick={() => {
              if (!onAttendanceFilterChange) return;

              const isSameSelection =
                activeAttendanceStatuses?.length === c.statuses.length &&
                c.statuses.every((status) =>
                  activeAttendanceStatuses.includes(status),
                );
              onAttendanceFilterChange(isSameSelection ? null : c.statuses);
            }}
          >
            <div
              className={styles.summaryIconWrap}
              style={{ background: c.bg }}
            >
              <Icon size={16} style={{ color: c.color }} />
            </div>
            <p style={{ fontSize: "22px", fontWeight: 800, color: c.color }}>
              {c.value}
            </p>
            <p style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500 }}>
              {c.label}
            </p>
          </button>
        );
      })}
    </>
  );
}
