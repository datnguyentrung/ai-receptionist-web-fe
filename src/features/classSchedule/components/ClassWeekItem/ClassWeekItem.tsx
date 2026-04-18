import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ScheduleStatus } from "@/config/constants";
import { ScheduleLocationLabel } from "@/config/constants";
import { useNavigateStudentListByClassScheduleId } from "@/hooks/useNavigation";
import type { ClassScheduleDetail } from "@/types";
import { formatTimeStringHM, getDurationInMinutes } from "@/utils/format";
import {
  EllipsisVertical,
  Info,
  MapPin,
  Play,
  PowerOff,
  UserPlus,
  Users,
} from "lucide-react";
import { memo, useState } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigateToStudentListByClassScheduleId =
    useNavigateStudentListByClassScheduleId();

  const handleMenuAction = (action: string) => {
    switch (action) {
      case "info":
        console.log("Xem thông tin lớp:", cls.scheduleId);
        break;
      case "stop":
        onRequestStatusChange(cls.scheduleId, cls.scheduleStatus);
        break;
      case "start":
        onRequestStatusChange(cls.scheduleId, cls.scheduleStatus);
        break;
      case "assign-coach":
        console.log("Phân công HLV:", cls.scheduleId);
        break;
      default:
        break;
    }
  };

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
      <DropdownMenu
        modal={false}
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
      >
        <DropdownMenuTrigger asChild>
          <button
            className={styles.menuBtn}
            aria-label="Thao tác lớp học"
            title="Click để mở menu"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(true);
            }}
          >
            <EllipsisVertical size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={styles.weekMenuContent}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            onSelect={() => handleMenuAction("info")}
            className={styles.menuItemWithIcon}
          >
            <Info size={14} />
            <span>Thông tin</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {cls.scheduleStatus === "ACTIVE" && (
            <DropdownMenuItem
              onSelect={() => handleMenuAction("stop")}
              className={styles.menuItemWithIcon}
            >
              <PowerOff size={14} />
              <span>Dừng hoạt động lớp</span>
            </DropdownMenuItem>
          )}
          {cls.scheduleStatus === "INACTIVE" && (
            <DropdownMenuItem
              onSelect={() => handleMenuAction("start")}
              className={styles.menuItemWithIcon}
            >
              <Play size={14} />
              <span>Mở hoạt động lớp</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => handleMenuAction("assign-coach")}
            className={styles.menuItemWithIcon}
          >
            <UserPlus size={14} />
            <span>Phân công HLV</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const ClassWeekItem = memo(ClassWeekItemInner);
