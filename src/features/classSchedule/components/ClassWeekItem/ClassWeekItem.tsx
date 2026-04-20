import { MiniActionPopover } from "@/components/ui/mini-action-popover";
import { showComingSoonActionToast } from "@/components/ui/mini-action-popover.toast";
import type { ScheduleStatus } from "@/config/constants";
import { ScheduleLocationLabel } from "@/config/constants";
import { useNavigateStudentListByClassScheduleId } from "@/hooks/useNavigation";
import type { ClassScheduleDetail } from "@/types";
import { formatTimeStringHM, getDurationInMinutes } from "@/utils/format";
import { useRoleStudent } from "@/utils/roleUtils";
import { EllipsisVertical, MapPin, Users } from "lucide-react";
import { memo } from "react";
import { LevelBadge, StatusBadge } from "../ClassBadges";
import styles from "./ClassWeekItem.module.scss";

function ClassWeekItemInner({
  cls,
  onRequestStatusChange,
}: {
  cls: ClassScheduleDetail;
  onRequestStatusChange: (
    scheduleId: string,
    currentStatus: ScheduleStatus,
  ) => void;
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
