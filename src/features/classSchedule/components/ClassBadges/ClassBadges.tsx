import type { ScheduleLevel, ScheduleStatus } from "@/config/constants";
import { ScheduleLevelLabel } from "@/config/constants";
import styles from "./ClassBadges.module.scss";

const DEFAULT_BADGE_STYLE = { bg: "#F3F4F6", color: "#6B7280" };

export function LevelBadge({ level }: { level: ScheduleLevel }) {
  const map: Record<ScheduleLevel, { bg: string; color: string }> = {
    BASIC: { bg: "#E0F2FE", color: "#0369A1" },
    KID: { bg: "#FEF9C3", color: "#854D0E" },
    ADULT: { bg: "#D1FAE5", color: "#065F46" },
    ASSISTANT: { bg: "#F3E8FF", color: "#6B21A8" },
    PERFORMANCE: { bg: "#FFF1F2", color: "#9F1239" },
    DAN: { bg: "#FEFCE8", color: "#854D0E" },
    SPARRING_TEAM_TIER_1: { bg: "#FEE2E2", color: "#991B1B" },
    SPARRING_TEAM_TIER_2: { bg: "#FFEDD5", color: "#9A3412" },
    SPARRING_TEAM_TIER_3: { bg: "#FEF3C7", color: "#92400E" },
    FORMS_TEAM_TIER_1: { bg: "#EDE9FE", color: "#4C1D95" },
    FORMS_TEAM_TIER_2: { bg: "#E0E7FF", color: "#3730A3" },
    FORMS_TEAM_TIER_3: { bg: "#DBEAFE", color: "#1E40AF" },
  };
  const s = map[level] ?? DEFAULT_BADGE_STYLE;
  const label = ScheduleLevelLabel[level] ?? "Không xác định";
  return (
    <span className={styles.badge} style={{ background: s.bg, color: s.color }}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: ScheduleStatus }) {
  const map: Record<ScheduleStatus, { label: string; bg: string; color: string }> = {
    ACTIVE: { label: "Đang mở", bg: "#D1FAE5", color: "#065F46" },
    INACTIVE: { label: "Đã kết thúc", bg: "#F3F4F6", color: "#6B7280" },
  };
  const s =
    map[status] ??
    ({ label: "Không xác định", ...DEFAULT_BADGE_STYLE } as const);
  return (
    <span className={styles.badge} style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}
