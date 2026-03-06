import Avatar from "@/components/Avatar";
import type { ClassScheduleDTO } from "@/data/mockData";
import {
  LevelBadge,
  StatusBadge,
} from "@/features/classSchedule/components/ClassBadges";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import styles from "./ClassCard.module.scss";

export function ClassCard({ cls }: { cls: ClassScheduleDTO }) {
  return (
    <div className={styles.classCard}>
      <div
        className={styles.cardAccent}
        style={{
          background:
            cls.status === "ongoing"
              ? "linear-gradient(90deg,#E02020,#7b0000)"
              : cls.status === "upcoming"
                ? "linear-gradient(90deg,#F59E0B,#D97706)"
                : "#E5E7EB",
        }}
      />
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
              {cls.className}
            </p>
            <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
              {cls.classCode}
            </p>
          </div>
          <div className={styles.cardBadges}>
            <LevelBadge level={cls.level} />
            <StatusBadge status={cls.status} />
          </div>
        </div>

        <div className={styles.coachRow}>
          <Avatar
            fullName={cls.coachAvatar}
            fontSize="9px"
            fontWeight={800}
            width="28px"
            height="28px"
          />
          <span style={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>
            {cls.coach}
          </span>
        </div>

        <div className={styles.infoRows}>
          <div className={styles.infoRow}>
            <Clock size={13} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: "12px" }}>
              {cls.time} ({cls.duration} phút)
            </span>
          </div>
          <div className={styles.infoRow}>
            <Calendar size={13} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: "12px" }}>
              {cls.dayOfWeek.join(" · ")}
            </span>
          </div>
          <div className={styles.infoRow}>
            <MapPin size={13} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: "12px" }}>{cls.room}</span>
          </div>
        </div>

        <div className={styles.capacitySection}>
          <div className={styles.capacityHeader}>
            <div className={styles.capacityUsers}>
              <Users size={12} />
              <span style={{ fontSize: "11px" }}>Sĩ số</span>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color:
                  cls.enrolled / cls.capacity > 0.8 ? "#E02020" : "#111827",
              }}
            >
              {cls.enrolled}/{cls.capacity}
            </span>
          </div>
          <div className={styles.capacityBar}>
            <div
              className={styles.capacityFill}
              style={{
                width: `${(cls.enrolled / cls.capacity) * 100}%`,
                background:
                  cls.enrolled / cls.capacity > 0.8
                    ? "#E02020"
                    : cls.enrolled / cls.capacity > 0.5
                      ? "#F59E0B"
                      : "#10B981",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
