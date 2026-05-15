import Avatar from "@/components/Avatar";
import { MiniActionPopover } from "@/components/ui/mini-action-popover";
import { showComingSoonActionToast } from "@/components/ui/mini-action-popover.toast";
import type { ScheduleStatus } from "@/config/constants";
import { ScheduleLocationLabel, ScheduleShiftLabel } from "@/config/constants";
import { useNavigateStudentListByClassScheduleId } from "@/hooks/useNavigation";
import type { ClassScheduleDetail } from "@/types";
import { getDurationInMinutes } from "@/utils/format";
import { useRoleStudent } from "@/utils/roleUtils";
import { Calendar, Clock, EllipsisVertical, MapPin, Users } from "lucide-react";
import { memo } from "react";
import { LevelBadge, StatusBadge } from "../ClassBadges";
import styles from "./ClassCard.module.scss";

function ClassCardInner({
  cls,
  onRequestStatusChange,
  onOpenSessionsModal,
}: {
  cls: ClassScheduleDetail;
  onRequestStatusChange: (
    scheduleId: string,
    currentStatus: ScheduleStatus,
  ) => void;
  onOpenSessionsModal: (scheduleId?: string) => void;
}) {
  const capacity = 40;
  const totalStudents = cls.totalStudents ?? 0;
  const occupancyRate = capacity > 0 ? totalStudents / capacity : 0;
  const navigateToStudentListByClassScheduleId =
    useNavigateStudentListByClassScheduleId();
  const { canViewManagerSenior } = useRoleStudent();
  const shiftLabel =
    ScheduleShiftLabel[cls.scheduleShift] ?? "Ca không xác định";
  const locationLabel =
    ScheduleLocationLabel[cls.scheduleLocation] ?? "Địa điểm không xác định";

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
            <p className={styles.weekdayLabel}>
              Thứ {cls.weekday}
            </p>
            <p className={styles.coachHint}>
              {cls.coaches.length > 0
                ? `HLV: ${cls.coaches.map((coach) => coach.fullName).join(" & ")}`
                : ""}
            </p>
          </div>
          <MiniActionPopover
            triggerClassName={styles.menuBtn}
            contentClassName={styles.classMenuContent}
            actions={[
              { id: "info", label: "Thông tin" },
              ...(canViewManagerSenior
                ? [
                    { id: "__separator__" as const },
                    ...(cls.scheduleStatus === "ACTIVE"
                      ? [{ id: "stop", label: "Dừng hoạt động lớp" }]
                      : cls.scheduleStatus === "INACTIVE"
                        ? [{ id: "start", label: "Mở hoạt động lớp" }]
                        : []),
                    { id: "__separator__" as const },
                    { id: "assign-coach", label: "Phân công HLV" },
                    { id: "session", label: "Thêm buổi học" },
                  ]
                : []),
            ]}
            onActionSelect={(action) => {
              switch (action) {
                case "info":
                  showComingSoonActionToast("Thông tin", cls.scheduleId);
                  break;
                case "stop":
                case "start":
                  if (canViewManagerSenior) {
                    onRequestStatusChange(cls.scheduleId, cls.scheduleStatus);
                  }
                  break;
                case "assign-coach":
                  if (canViewManagerSenior) {
                    showComingSoonActionToast("Phân công HLV", cls.scheduleId);
                  }
                  break;
                case "session":
                  if (canViewManagerSenior) {
                    onOpenSessionsModal(cls.scheduleId);
                  }
                  break;
                default:
                  break;
              }
            }}
          >
            <EllipsisVertical size={16} />
          </MiniActionPopover>
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
              <span>
                {c.fullName}
              </span>
            </div>
          ))}

        <div className={styles.infoBadgeSection}>
          <div className={styles.infoRows}>
            <div className={styles.infoRow}>
              <Clock size={13} />
              <span>
                {cls.startTime} - {cls.endTime} (
                {getDurationInMinutes(cls.startTime, cls.endTime)} phút)
              </span>
            </div>
            <div className={styles.infoRow}>
              <Calendar size={13} />
              <span>{shiftLabel}</span>
            </div>
            <div className={styles.infoRow}>
              <MapPin size={13} />
              <span>{locationLabel}</span>
            </div>
          </div>
          <div className={styles.cardBadges}>
            <LevelBadge level={cls.scheduleLevel} />
            <StatusBadge status={cls.scheduleStatus} />
          </div>
        </div>

        <div className={styles.capacitySection}>
          <div className={styles.capacityHeader}>
            <div className={styles.capacityUsers}>
              <Users size={12} />
              <span>Sĩ số</span>
            </div>
            <span
              className={`${styles.capacityValue} ${occupancyRate > 0.8 ? styles.capacityValueHigh : ""}`}
            >
              {totalStudents}/{capacity}
            </span>
          </div>
          <div className={styles.capacityBar}>
            <div
              className={styles.capacityFill}
              style={{
                width: `${Math.min(100, occupancyRate * 100)}%`,
                background:
                  occupancyRate > 1
                    ? "#E02020"
                    : occupancyRate > 0.6
                      ? "#10B981"
                      : "#F59E0B",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const ClassCard = memo(ClassCardInner);
