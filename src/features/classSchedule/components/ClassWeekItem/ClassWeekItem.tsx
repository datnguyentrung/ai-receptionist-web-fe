import type { ClassScheduleDTO } from "@/data/mockData";
import {
  LevelBadge,
  StatusBadge,
} from "@/features/classSchedule/components/ClassBadges";
import { ChevronRight, MapPin, Users } from "lucide-react";
import styles from "./ClassWeekItem.module.scss";

export function ClassWeekItem({ cls }: { cls: ClassScheduleDTO }) {
  return (
    <div className={styles.weekClassItem}>
      <div className={styles.timeBlock}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "#E02020" }}>
          {cls.time.split(" - ")[0]}
        </p>
        <p style={{ fontSize: "10px", color: "#9CA3AF" }}>{cls.duration}p</p>
      </div>

      <div className={styles.weekClassInfo}>
        <div className={styles.weekClassTitleRow}>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
            {cls.className}
          </p>
          <LevelBadge level={cls.level} />
        </div>
        <div className={styles.weekClassMetaRow}>
          <span className={styles.metaItem}>
            <Users size={11} /> {cls.enrolled}/{cls.capacity} HV
          </span>
          <span className={styles.metaItem}>
            <MapPin size={11} /> {cls.room}
          </span>
          <span className={styles.metaItem}>HLV: {cls.coach}</span>
        </div>
      </div>

      <StatusBadge status={cls.status} />
      <ChevronRight size={16} style={{ color: "#D1D5DB", flexShrink: 0 }} />
    </div>
  );
}
