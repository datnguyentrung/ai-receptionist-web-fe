import Avatar from "@/components/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ScheduleStatus } from "@/config/constants";
import { ScheduleLocationLabel, ScheduleShiftLabel } from "@/config/constants";
import { useNavigateStudentListByClassScheduleId } from "@/hooks/useNavigation";
import type { ClassScheduleDetail } from "@/types";
import { getDurationInMinutes } from "@/utils/format";
import {
  Calendar,
  Clock,
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
import styles from "./ClassCard.module.scss";

function ClassCardInner({
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
  const capacity = 40;
  const totalStudents = cls.totalStudents ?? 0;
  const occupancyRate = capacity > 0 ? totalStudents / capacity : 0;
  const navigateToStudentListByClassScheduleId =
    useNavigateStudentListByClassScheduleId();
  const shiftLabel =
    ScheduleShiftLabel[cls.scheduleShift] ?? "Ca không xác định";
  const locationLabel =
    ScheduleLocationLabel[cls.scheduleLocation] ?? "Địa điểm không xác định";

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
              Thứ {cls.weekday}
            </p>
            <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
              {cls.coaches.length > 0
                ? `HLV: ${cls.coaches.map((coach) => coach.fullName).join(" & ")}`
                : ""}
            </p>
          </div>
          <DropdownMenu
            modal={false}
            open={isMenuOpen}
            onOpenChange={setIsMenuOpen}
          >
            <DropdownMenuTrigger asChild>
              <button
                className={styles.menuBtn}
                aria-label="Thao tác lớp học"
                title="Click chuột trái hoặc phải để mở menu"
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
              className={styles.classMenuContent}
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

        <div className={styles.infoBadgeSection}>
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
              <span style={{ fontSize: "12px" }}>{shiftLabel}</span>
            </div>
            <div className={styles.infoRow}>
              <MapPin size={13} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "12px" }}>{locationLabel}</span>
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
              <span style={{ fontSize: "11px" }}>Sĩ số</span>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: occupancyRate > 0.8 ? "#E02020" : "#111827",
              }}
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
