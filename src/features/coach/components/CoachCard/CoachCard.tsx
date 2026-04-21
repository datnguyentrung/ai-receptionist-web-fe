import Avatar from "@/components/Avatar";
import { MiniActionPopover } from "@/components/ui/mini-action-popover";
import { showComingSoonActionToast } from "@/components/ui/mini-action-popover.toast";
import {
  ScheduleLevelLabel,
  ScheduleShiftLabel,
  WeekdayCodeToLabel,
} from "@/config/constants";
import type { CoachDetail } from "@/types";
import { openInNewTab } from "@/utils/windowOpenTab";
import { EllipsisVertical, Mail, Phone, Star } from "lucide-react";
import { formatDateDMY } from "../../../../utils/format";
import StatusBadge from "../StatusBadge/StatusBadge";
import styles from "./CoachCard.module.scss";

type CoachCardProps = {
  coach: CoachDetail;
  onOpenUpdate?: (coach: CoachDetail) => void;
};

export default function CoachCard({ coach, onOpenUpdate }: CoachCardProps) {
  const currentAssignments = coach.currentAssignments ?? [];

  return (
    <div className={styles.coachCard}>
      {/* Card top bar */}
      <div
        className={styles.cardAccent}
        style={{
          background:
            coach.status === "ACTIVE"
              ? "linear-gradient(90deg,#E02020,#7b0000)"
              : "#E5E7EB",
        }}
      />
      <div className={styles.cardBody}>
        <div className={styles.cardTopRow}>
          <div className={styles.coachInfo}>
            <Avatar
              fullName={coach.fullName}
              fontSize="13px"
              fontWeight={800}
              width="48px"
              height="48px"
            />
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                {coach.fullName}
              </p>
              <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
                {/* {coach.specialty} */}
                {coach.belt} · {formatDateDMY(coach.birthDate)}
              </p>
            </div>
          </div>
          <MiniActionPopover
            itemLabel={coach.fullName}
            triggerClassName={styles.moreBtn}
            title={`Tùy chọn cho ${coach.fullName}`}
            actions={[
              { id: "info", label: "Thông tin" },
              { id: "assign-class", label: "Phân lớp dạy" },
              { id: "assignment-history", label: "Lịch sử phân lớp" },
            ]}
            onActionSelect={(action) => {
              if (action === "assign-class") {
                onOpenUpdate?.(coach);
                return;
              }

              if (action === "info") {
                openInNewTab(`/${coach.staffCode}`);
                return;
              }

              showComingSoonActionToast("Lịch sử phân lớp", coach.fullName);
            }}
          >
            <EllipsisVertical size={15} />
          </MiniActionPopover>
        </div>

        <div className={styles.statusSection}>
          <StatusBadge status={coach.coachStatus} />
        </div>

        {/* Current assignments */}
        <div className={styles.assignmentsSection}>
          <div className={styles.assignmentsHeader}>
            <p className={styles.assignmentsTitle}>Lớp đang dạy</p>
            <span className={styles.assignmentsCount}>
              {currentAssignments.length}
            </span>
          </div>

          {currentAssignments.length === 0 ? (
            <p className={styles.assignmentsEmpty}>
              Hiện chưa có lớp đang dạy.
            </p>
          ) : (
            <div className={styles.assignmentsList}>
              {currentAssignments.slice(0, 3).map((assignment) => {
                const schedule = assignment.classSchedule;
                const weekdayLabel =
                  WeekdayCodeToLabel[schedule.weekday] ??
                  `Thứ ${schedule.weekday}`;

                return (
                  <div
                    key={assignment.assignmentId}
                    className={styles.assignmentItem}
                  >
                    <div className={styles.assignmentTopRow}>
                      <p className={styles.assignmentName}>
                        {schedule.scheduleId}
                      </p>
                      <span className={styles.assignmentBadge}>
                        {weekdayLabel}
                      </span>
                    </div>
                    <p className={styles.assignmentMeta}>
                      {ScheduleLevelLabel[schedule.scheduleLevel]} ·{" "}
                      {ScheduleShiftLabel[schedule.scheduleShift]}
                    </p>
                    <p className={styles.assignmentLocation}>
                      {schedule.branchName} · {schedule.startTime} -{" "}
                      {schedule.endTime}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rating */}
        <div className={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={13}
              fill={s <= Math.round(2.9) ? "#F59E0B" : "none"}
              style={{ color: "#F59E0B" }}
            />
          ))}
          <span className={styles.ratingValue}>{2.9}</span>
        </div>

        {/* Contact */}
        <div className={styles.contactRow}>
          <a href={`tel:${coach.phoneNumber}`} className={styles.contactLink}>
            <Phone size={13} />
            <span style={{ fontSize: "11px" }}>{coach.phoneNumber}</span>
          </a>
          <a href={`mailto:${coach.email}`} className={styles.contactLinkRight}>
            <Mail size={13} />
            <span
              style={{
                fontSize: "11px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                // maxWidth: "130px",
              }}
            >
              {coach.email || "Không có email"}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
