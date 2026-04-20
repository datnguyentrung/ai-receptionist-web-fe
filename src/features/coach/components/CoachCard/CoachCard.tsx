import Avatar from "@/components/Avatar";
import { MiniActionPopover } from "@/components/ui/mini-action-popover";
import { showComingSoonActionToast } from "@/components/ui/mini-action-popover.toast";
import type { CoachDetail } from "@/types";
import {
  Award,
  BookOpen,
  EllipsisVertical,
  Mail,
  Phone,
  Star,
  Users,
} from "lucide-react";
import { formatDateDMY } from "../../../../utils/format";
import StatusBadge from "../StatusBadge/StatusBadge";
import styles from "./CoachCard.module.scss";

type CoachCardProps = {
  coach: CoachDetail;
  onOpenUpdate?: (coach: CoachDetail) => void;
};

export default function CoachCard({ coach, onOpenUpdate }: CoachCardProps) {
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
                showComingSoonActionToast("Thông tin", coach.fullName);
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

        {/* Stats row */}
        <div className={styles.statsGrid}>
          {[
            {
              icon: Users,
              value: 0,
              label: "Học viên",
            },
            {
              icon: BookOpen,
              value: 0,
              label: "Lớp học",
            },
            {
              icon: Award,
              value: `${0} năm`,
              label: "Kinh nghiệm",
            },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className={styles.statItem}>
              <Icon
                size={14}
                style={{ color: "#E02020", margin: "0 auto 2px" }}
              />
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                {value}
              </p>
              <p style={{ fontSize: "10px", color: "#9CA3AF" }}>{label}</p>
            </div>
          ))}
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
