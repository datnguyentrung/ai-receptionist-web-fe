import Avatar from "@/components/Avatar";
import { ScheduleLocationLabel, ScheduleShiftLabel } from "@/config/constants";
import type { ClassScheduleDetail } from "@/types";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { useNavigateStudentListByClassScheduleId } from "../../../../hooks/useNavigation";
import { getDurationInMinutes } from "../../../../utils/format";
import { LevelBadge, StatusBadge } from "../ClassBadges";
import styles from "./ClassCard.module.scss";

export function ClassCard({ cls }: { cls: ClassScheduleDetail }) {
  const enrolled = (cls.scheduleId.charCodeAt(0) * 7) % 100; // Mock enrolled students, replace with actual data when available
  const capacity = 100;
  const navigateToStudentListByClassScheduleId =
    useNavigateStudentListByClassScheduleId();

  return (
    <div
      className={styles.classCard}
      onClick={() =>
        navigateToStudentListByClassScheduleId({
          classScheduleId: cls.scheduleId,
        })
      }
    >
      <div
        className={styles.cardAccent}
        style={{
          background:
            cls.scheduleStatus === "ACTIVE"
              ? "linear-gradient(90deg,#E02020,#7b0000)"
              : cls.scheduleStatus === "INACTIVE"
                ? "linear-gradient(90deg,#F59E0B,#D97706)"
                : "#E5E7EB",
        }}
      />
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
              {cls.branchName}
            </p>
            <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
              {ScheduleShiftLabel[cls.scheduleShift]}
            </p>
          </div>
          <div className={styles.cardBadges}>
            <LevelBadge level={cls.scheduleLevel} />
            <StatusBadge status={cls.scheduleStatus} />
          </div>
        </div>

        {cls.coaches.length > 0 &&
          cls.coaches.map((c) => (
            <div className={styles.coachRow} key={c.staffCode}>
              <Avatar
                fullName={c.fullName}
                fontSize="9px"
                fontWeight={800}
                width="28px"
                height="28px"
              />
              <span
                style={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}
              >
                {c.fullName}
              </span>
            </div>
          ))}

        <div className={styles.infoRows}>
          <div className={styles.infoRow}>
            <Clock size={13} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: "12px" }}>
              {cls.startTime} - {cls.endTime} (
              {getDurationInMinutes(cls.startTime, cls.endTime)} phút)
            </span>
          </div>
          <div className={styles.infoRow}>
            <Calendar size={13} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: "12px" }}>Thứ {cls.weekday}</span>
          </div>
          <div className={styles.infoRow}>
            <MapPin size={13} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: "12px" }}>
              {ScheduleLocationLabel[cls.scheduleLocation]}
            </span>
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
                color: enrolled / capacity > 0.8 ? "#E02020" : "#111827",
              }}
            >
              {enrolled}/{capacity}
            </span>
          </div>
          <div className={styles.capacityBar}>
            <div
              className={styles.capacityFill}
              style={{
                width: `${(enrolled / capacity) * 100}%`,
                background:
                  // cls.enrolled / cls.capacity > 0.8
                  enrolled / capacity > 0.8
                    ? "#E02020"
                    : // : cls.enrolled / cls.capacity > 0.5
                      enrolled / capacity > 0.5
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
