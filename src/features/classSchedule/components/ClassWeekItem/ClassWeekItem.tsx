import { MiniActionPopover } from "@/components/ui/mini-action-popover";
import { showComingSoonActionToast } from "@/components/ui/mini-action-popover.toast";
import type { ScheduleStatus } from "@/config/constants";
import { ScheduleLocationLabel, ScheduleShiftLabel } from "@/config/constants";
import { useNavigateStudentListByClassScheduleId } from "@/hooks/useNavigation";
import type { ClassScheduleDetail } from "@/types";
import { formatTimeStringHM, getDurationInMinutes } from "@/utils/format";
import { useRoleStudent } from "@/utils/roleUtils";
import { Clock, EllipsisVertical, MapPin, Users } from "lucide-react";
import { memo } from "react";
import { LevelBadge, StatusBadge } from "../ClassBadges";
import styles from "./ClassWeekItem.module.scss";

function ClassWeekItemInner({
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
  const navigateToStudentListByClassScheduleId =
    useNavigateStudentListByClassScheduleId();
  const { canViewManagerSenior } = useRoleStudent();

  return (
    <div
      className={styles.weekClassItem}
      onClick={() =>
        navigateToStudentListByClassScheduleId({
          classScheduleId: cls.scheduleId,
        })
      }
    >
      <div className={styles.weekClassInfo}>
        <div className={styles.weekClassTitleRow}>
          <p className={styles.weekClassTitle}>
            {cls.branchName} - {ScheduleShiftLabel[cls.scheduleShift]}
          </p>
          <div className={styles.weekClassBadges}>
            <LevelBadge level={cls.scheduleLevel} />
            <StatusBadge status={cls.scheduleStatus} />
          </div>
        </div>

        <div className={styles.weekClassMetaRow}>
          <span className={`${styles.metaItem} ${styles.timeMetaItem}`}>
            <Clock size={11} />
            {formatTimeStringHM(cls.startTime)} -{" "}
            {formatTimeStringHM(cls.endTime)}
            <span className={styles.metaMuted}>
              {getDurationInMinutes(cls.startTime, cls.endTime)} phút
            </span>
          </span>
          <span className={styles.metaItem}>
            <Users size={11} /> {cls.totalStudents} HV
          </span>
          <span className={styles.metaItem}>
            <MapPin size={11} /> {ScheduleLocationLabel[cls.scheduleLocation]}
          </span>
          <span className={`${styles.metaItem} ${styles.coachMetaItem}`}>
            HLV: {cls.coaches.map((c) => c.fullName).join(", ")}
          </span>
        </div>
      </div>

      <MiniActionPopover
        triggerClassName={styles.menuBtn}
        contentClassName={styles.weekMenuContent}
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
  );
}

export const ClassWeekItem = memo(ClassWeekItemInner);
