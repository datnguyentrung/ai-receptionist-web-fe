import { ScheduleLocationLabel } from "@/config/constants";
import { useNavigateStudentListByClassScheduleId } from "@/hooks/useNavigation";
import type { ClassScheduleDetail } from "@/types";
import { formatTimeStringHM, getDurationInMinutes } from "@/utils/format";
import { ChevronRight, MapPin, Users } from "lucide-react";
import { LevelBadge, StatusBadge } from "../ClassBadges";
import styles from "./ClassWeekItem.module.scss";

export function ClassWeekItem({ cls }: { cls: ClassScheduleDetail }) {
  const navigateToStudentListByClassScheduleId =
    useNavigateStudentListByClassScheduleId();

  return (
    <div
      className={styles.weekClassItem}
      onClick={() =>
        navigateToStudentListByClassScheduleId({
          classScheduleId: cls.scheduleId,
        })
      }
    >
      <div className={styles.timeBlock}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "#E02020" }}>
          {formatTimeStringHM(cls.startTime)} -{" "}
          {formatTimeStringHM(cls.endTime)}
        </p>
        <p style={{ fontSize: "10px", color: "#9CA3AF" }}>
          {getDurationInMinutes(cls.startTime, cls.endTime)} phút
        </p>
      </div>

      <div className={styles.weekClassInfo}>
        <div className={styles.weekClassTitleRow}>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
            {cls.branchName}
          </p>
          <LevelBadge level={cls.scheduleLevel} />
        </div>
        <div className={styles.weekClassMetaRow}>
          <span className={styles.metaItem}>
            <Users size={11} /> {cls.totalStudents} HV
          </span>
          <span className={styles.metaItem}>
            <MapPin size={11} /> {ScheduleLocationLabel[cls.scheduleLocation]}
          </span>
          <span className={styles.metaItem}>
            HLV: {cls.coaches.map((c) => c.fullName).join(", ")}
          </span>
        </div>
      </div>

      <StatusBadge status={cls.scheduleStatus} />
      <ChevronRight size={16} style={{ color: "#D1D5DB", flexShrink: 0 }} />
    </div>
  );
}
