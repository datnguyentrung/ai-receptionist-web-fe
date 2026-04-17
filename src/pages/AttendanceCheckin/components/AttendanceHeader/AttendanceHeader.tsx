import type { AttendanceStatus } from "@/config/constants";
import {
  ScheduleLevelLabel,
  ScheduleLocationLabel,
  ScheduleShiftLabel,
  WeekdayCodeToLabel,
} from "@/config/constants";
import { useNavigateBack } from "@/hooks/useNavigation";
import type { ClassScheduleSummary } from "@/types";
import { formatDateDMY } from "@/utils/format";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  MapPin,
  RotateCcw,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { memo } from "react";
import { useRoleStudent } from "../../../../utils/roleUtils";
import styles from "./AttendanceHeader.module.scss";

interface AttendanceHeaderProps {
  session: ClassScheduleSummary;
  markedCount: number;
  totalCount: number;
  progress: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  unmarkedCount: number;
  evalCount: number;
  filter: "all" | AttendanceStatus;
  onFilterChange: (f: "all" | AttendanceStatus) => void;
  onMarkAll: (status: NonNullable<AttendanceStatus>) => void;
  onReset: () => void;
}

// Link: /schedules/[:scheduleId]

function AttendanceHeaderInner({
  session,
  markedCount,
  totalCount,
  progress,
  presentCount,
  absentCount,
  excusedCount,
  unmarkedCount,
  evalCount,
  filter,
  onFilterChange,
  onMarkAll,
  onReset,
}: AttendanceHeaderProps) {
  const onBack = useNavigateBack();
  const { canViewManager } = useRoleStudent();
  const scheduleLevelLabel =
    ScheduleLevelLabel[session.scheduleLevel] ?? "Lớp không xác định";
  const scheduleShiftLabel =
    ScheduleShiftLabel[session.scheduleShift] ?? "Ca không xác định";
  const scheduleLocationLabel =
    ScheduleLocationLabel[session.scheduleLocation] ??
    "Địa điểm không xác định";
  const weekdayLabel = WeekdayCodeToLabel[session.weekday] ?? "Không xác định";

  return (
    <div className={styles.header}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>
          <ChevronLeft size={18} style={{ color: "#374151" }} />
        </button>
        <div className={styles.headerTitle}>
          <p className={styles.className}>{session.branchName}</p>
          <p className={styles.classCode}>
            {scheduleLevelLabel} · {scheduleShiftLabel}
          </p>
        </div>
        {session.scheduleId === "in-progress" && (
          <span className={styles.statusPill}>
            <span className={styles.statusDot} />
            Đang mở
          </span>
        )}
      </div>

      {/* Class Info Card */}
      <div className={styles.classInfoCard}>
        <div className={styles.classInfoDecor} />
        {[
          {
            icon: MapPin,
            text: scheduleLocationLabel,
          },
          { icon: Clock, text: `${session.startTime} – ${session.endTime}` },
          {
            icon: Calendar,
            text: `${weekdayLabel}, ${formatDateDMY(new Date())}`,
          },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className={styles.classInfoItem}>
            <div className={styles.classInfoIcon}>
              <Icon size={12} style={{ color: "white" }} />
            </div>
            <p className={styles.classInfoText}>{text}</p>
          </div>
        ))}
      </div>

      {/* Progress bar + stats */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <p className={styles.progressLabel}>Tiến độ điểm danh</p>
          <p className={styles.progressCount}>
            {markedCount}/{totalCount}
          </p>
        </div>
        <div className={styles.progressTrack}>
          <motion.div
            className={styles.progressBar}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        {/* Mini stat row */}
        <div className={styles.statRow}>
          {[
            { label: "Có mặt", count: presentCount, color: "#16A34A" },
            { label: "Vắng", count: absentCount, color: "#E02020" },
            { label: "Có phép", count: excusedCount, color: "#D97706" },
            { label: "Chờ", count: unmarkedCount, color: "#9CA3AF" },
          ].map((s) => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statValue} style={{ color: s.color }}>
                {s.count}
              </span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
          <div className={styles.evalCount}>
            <Star size={11} style={{ color: "#F59E0B" }} />
            <span className={styles.evalCountText}>{evalCount} đánh giá</span>
          </div>
        </div>
      </div>

      {/* Quick actions + filter */}
      <div className={styles.quickActions}>
        <div className={styles.actionBtns}>
          {canViewManager && (
            <button
              onClick={() => onMarkAll("PRESENT")}
              className={styles.btnMarkAll}
            >
              <CheckCircle2 size={12} /> Tất cả có mặt
            </button>
          )}
          <button onClick={onReset} className={styles.btnReset}>
            <RotateCcw size={11} /> Reset
          </button>
        </div>
        <div className={styles.divider} />
        <div className={styles.filterTabs}>
          {(
            [
              { label: "Tất cả", key: "all" },
              { label: "Có mặt", key: "PRESENT" },
              { label: "Vắng", key: "ABSENT" },
              { label: "Có phép", key: "EXCUSED" },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`${styles.filterBtn} ${filter === f.key ? styles.active : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const AttendanceHeader = memo(AttendanceHeaderInner);
