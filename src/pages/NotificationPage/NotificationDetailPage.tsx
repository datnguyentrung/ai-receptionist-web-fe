import {
  NotificationRecipientStatusLabel,
  NotificationTypeLabel,
} from "@/config/constants";
import {
  isNotificationMarkReadPending,
  useMarkNotificationRead,
  useNotificationDetail,
} from "@/features/notification/queries/notificationQueries";
import type { NotificationRecipientResponse } from "@/types";
import {
  ArrowLeft,
  Bell,
  CalendarRange,
  ClipboardCheck,
  CreditCard,
  ExternalLink,
  Megaphone,
  RefreshCw,
  TimerReset,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./NotificationPage.module.scss";
import { useCurrentUserCode } from "@/hooks/useAuth";

function formatDetailDate(value?: string | null) {
  if (!value) return "Chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function NotificationTypeIcon({
  type,
  size,
}: {
  type: NotificationRecipientResponse["notificationType"];
  size: number;
}) {
  switch (type) {
    case "ATTENDANCE":
      return <ClipboardCheck size={size} strokeWidth={2.2} />;
    case "TUITION":
      return <CreditCard size={size} strokeWidth={2.2} />;
    case "CLASS_SCHEDULE":
      return <CalendarRange size={size} strokeWidth={2.2} />;
    case "COACH_TIMESHEET":
      return <TimerReset size={size} strokeWidth={2.2} />;
    case "ANNOUNCEMENT":
      return <Megaphone size={size} strokeWidth={2.2} />;
    case "SYSTEM":
    default:
      return <Bell size={size} strokeWidth={2.2} />;
  }
}

function getWhitelistedAction(
  notification: NotificationRecipientResponse,
  userCode?: string,
) {
  if (notification.notificationType === "CLASS_SCHEDULE") {
    return { label: "Mở lịch học", to: "/schedules" };
  }

  if (notification.notificationType === "ATTENDANCE" && userCode) {
    return { label: "Mở nhật ký điểm danh", to: `/${userCode}/progress` };
  }

  if (notification.notificationType === "COACH_TIMESHEET") {
    return { label: "Mở chấm công", to: "/history/coach" };
  }

  return null;
}

type NotificationLocationState = {
  fromNotificationsSearch?: string;
};

export function NotificationDetailPage() {
  const { notificationRecipientId } = useParams<{
    notificationRecipientId: string;
  }>();
  const navigate = useNavigate();
  const userCode = useCurrentUserCode();
  const location = useLocation();
  const locationState = location.state as NotificationLocationState | null;
  const detailQuery = useNotificationDetail(notificationRecipientId);
  const {
    mutate: markRead,
    isPending: isMarkReadPending,
  } = useMarkNotificationRead();
  const detail = detailQuery.data;

  useEffect(() => {
    if (!detail || detail.read || isMarkReadPending) return;
    if (isNotificationMarkReadPending(detail.notificationRecipientId)) return;

    markRead(detail.notificationRecipientId);
  }, [detail, isMarkReadPending, markRead]);

  const backToList = () => {
    navigate(`/notifications${locationState?.fromNotificationsSearch ?? ""}`, {
      replace: true,
    });
  };

  if (detailQuery.isLoading || detailQuery.isPending) {
    return (
      <div className={styles.detailPage} aria-busy="true">
        <div className={styles.skeletonCard} />
        <div className={styles.skeletonCard} />
      </div>
    );
  }

  if (detailQuery.isError || !detail) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.errorState}>
          <Bell size={30} strokeWidth={2.1} />
          <h2>Không tìm thấy thông báo</h2>
          <p>Thông báo có thể đã bị xóa hoặc bạn không còn quyền xem.</p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => void detailQuery.refetch()}
          >
            <RefreshCw size={17} strokeWidth={2.2} />
            Thử lại
          </button>
          <button type="button" className={styles.ghostButton} onClick={backToList}>
            <ArrowLeft size={17} strokeWidth={2.2} />
            Quay về danh sách
          </button>
        </div>
      </div>
    );
  }

  const action = getWhitelistedAction(detail, userCode);

  return (
    <article className={styles.detailPage}>
      <section className={styles.detailHero}>
        <div className={styles.detailTitleRow}>
          <span className={styles.detailIcon}>
            <NotificationTypeIcon type={detail.notificationType} size={22} />
          </span>
          <div className={styles.detailTitle}>
            <h2>{detail.title}</h2>
            <div className={styles.detailMeta}>
              <span className={styles.metaPill}>
                {NotificationTypeLabel[detail.notificationType]}
              </span>
              <span className={styles.statusPill}>
                {detail.read ? "Đã đọc" : "Chưa đọc"}
              </span>
              <span className={styles.metaPill}>
                {NotificationRecipientStatusLabel[detail.recipientStatus]}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.detailBody}>{detail.body}</section>

      <section className={styles.referencePanel} aria-label="Thông tin liên quan">
        <h3>Thông tin</h3>
        <div className={styles.referenceGrid}>
          <div className={styles.referenceItem}>
            <span>Đã tạo</span>
            <strong>{formatDetailDate(detail.createdAt)}</strong>
          </div>
          <div className={styles.referenceItem}>
            <span>Đã gửi</span>
            <strong>{formatDetailDate(detail.deliveredAt)}</strong>
          </div>
          <div className={styles.referenceItem}>
            <span>Đã đọc</span>
            <strong>{formatDetailDate(detail.readAt)}</strong>
          </div>
          {detail.referenceType ? (
            <div className={styles.referenceItem}>
              <span>Loại liên kết</span>
              <strong>{detail.referenceType}</strong>
            </div>
          ) : null}
          {detail.referenceId ? (
            <div className={styles.referenceItem}>
              <span>Mã liên kết</span>
              <strong>{detail.referenceId}</strong>
            </div>
          ) : null}
        </div>

        <div className={styles.detailActions}>
          {action ? (
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => navigate(action.to)}
            >
              <ExternalLink size={17} strokeWidth={2.2} />
              {action.label}
            </button>
          ) : null}
          <button type="button" className={styles.ghostButton} onClick={backToList}>
            <ArrowLeft size={17} strokeWidth={2.2} />
            Quay về danh sách
          </button>
        </div>
      </section>
    </article>
  );
}

export default NotificationDetailPage;
