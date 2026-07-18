import { NotificationTypeLabel } from "@/config/constants";
import {
  isNotificationType,
  notificationTypes,
  useNotifications,
  type NotificationListFilters,
} from "@/features/notification/queries/notificationQueries";
import { useDebounce } from "@/hooks/useDebounce";
import type {
  NotificationFilters,
  NotificationRecipientResponse,
  NotificationType,
} from "@/types";
import {
  Bell,
  BellDot,
  CalendarRange,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Megaphone,
  RefreshCw,
  Search,
  TimerReset,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import styles from "./NotificationPage.module.scss";

type NotificationTab = "all" | "unread";

const tabLabels: Record<NotificationTab, string> = {
  all: "Tất cả",
  unread: "Chưa đọc",
};

function getTab(value: string | null): NotificationTab {
  return value === "unread" ? "unread" : "all";
}

function formatDate(value?: string | null) {
  if (!value) return "Chưa có thời gian";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function NotificationTypeIcon({
  type,
  size,
}: {
  type: NotificationType;
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

function NotificationSearchBox({
  initialValue,
  onDebouncedChange,
}: {
  initialValue: string;
  onDebouncedChange: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, 400);

  useEffect(() => {
    onDebouncedChange(debouncedValue.trim());
  }, [debouncedValue, onDebouncedChange]);

  return (
    <label className={styles.searchBox}>
      <Search size={18} strokeWidth={2.1} />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Tìm theo tiêu đề, nội dung..."
      />
    </label>
  );
}

function NotificationCard({
  notification,
  onOpen,
}: {
  notification: NotificationRecipientResponse;
  onOpen: (notification: NotificationRecipientResponse) => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.notificationCard} ${
        notification.read ? "" : styles.notificationCardUnread
      }`}
      onClick={() => onOpen(notification)}
    >
      <span className={styles.iconWrap}>
        <NotificationTypeIcon type={notification.notificationType} size={21} />
      </span>
      <span className={styles.cardContent}>
        <h3>{notification.title}</h3>
        <p>{notification.body}</p>
        <span className={styles.cardMeta}>
          <span className={styles.metaPill}>
            {NotificationTypeLabel[notification.notificationType]}
          </span>
          <span className={styles.metaPill}>
            {formatDate(notification.createdAt)}
          </span>
          {!notification.read ? (
            <span className={styles.statusPill}>Chưa đọc</span>
          ) : null}
        </span>
      </span>
      <span className={styles.cardArrow} aria-hidden="true">
        {!notification.read ? <span className={styles.unreadDot} /> : null}
        <ChevronRight size={18} strokeWidth={2.2} />
      </span>
    </button>
  );
}

export function NotificationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParamsString = searchParams.toString();
  const tab = getTab(searchParams.get("tab"));
  const urlSearch = searchParams.get("q")?.trim() ?? "";
  const urlType = searchParams.get("type");
  const selectedType = isNotificationType(urlType) ? urlType : undefined;

  const replaceSearchParams = useCallback(
    (update: (nextParams: URLSearchParams) => void) => {
      const nextParams = new URLSearchParams(searchParamsString);
      update(nextParams);
      if (nextParams.toString() !== searchParamsString) {
        setSearchParams(nextParams, { replace: true });
      }
    },
    [searchParamsString, setSearchParams],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      replaceSearchParams((nextParams) => {
        if (value) {
          nextParams.set("q", value);
        } else {
          nextParams.delete("q");
        }
      });
    },
    [replaceSearchParams],
  );

  const filters = useMemo<NotificationFilters>(
    () => ({
      read: tab === "unread" ? false : undefined,
      search: urlSearch || undefined,
      type: selectedType,
      sortBy: "createdAt",
      sortDir: "desc",
    }),
    [selectedType, tab, urlSearch],
  );

  const notificationsQuery = useNotifications(filters);
  const notifications = useMemo(
    () =>
      notificationsQuery.data?.pages.flatMap(
        (page) => page.notifications.content,
      ) ?? [],
    [notificationsQuery.data],
  );
  const unreadCount = notificationsQuery.data?.pages[0]?.unreadCount ?? 0;
  const totalElements =
    notificationsQuery.data?.pages[0]?.notifications.totalElements ?? 0;
  const isInitialLoading =
    notificationsQuery.isLoading || notificationsQuery.isPending;

  const handleTabChange = (nextTab: NotificationTab) => {
    replaceSearchParams((nextParams) => {
      if (nextTab === "all") {
        nextParams.delete("tab");
      } else {
        nextParams.set("tab", nextTab);
      }
    });
  };

  const handleTypeChange = (type?: NotificationListFilters["type"]) => {
    replaceSearchParams((nextParams) => {
      if (type) {
        nextParams.set("type", type);
      } else {
        nextParams.delete("type");
      }
    });
  };

  const handleOpenNotification = (notification: NotificationRecipientResponse) => {
    navigate(`/notifications/${notification.notificationRecipientId}`, {
      state: { fromNotificationsSearch: location.search },
    });
  };

  return (
    <div className={styles.notificationPage}>
      <section className={styles.summaryCard} aria-label="Tổng quan thông báo">
        <div className={styles.summaryCopy}>
          <span>Trung tâm thông báo</span>
          <h2>Thông báo của bạn</h2>
          <p>{totalElements} thông báo đang được đồng bộ</p>
        </div>
        <div className={styles.unreadBubble} aria-label={`${unreadCount} thông báo chưa đọc`}>
          <strong>{unreadCount}</strong>
          <small>chưa đọc</small>
        </div>
      </section>

      <section className={styles.toolbar} aria-label="Bộ lọc thông báo">
        <div className={styles.tabRow} role="tablist" aria-label="Trạng thái đọc">
          {(["all", "unread"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              className={`${styles.tabButton} ${
                tab === item ? styles.tabButtonActive : ""
              }`}
              onClick={() => handleTabChange(item)}
            >
              {tabLabels[item]}
            </button>
          ))}
        </div>

        <NotificationSearchBox
          key={urlSearch}
          initialValue={urlSearch}
          onDebouncedChange={handleSearchChange}
        />

        <div className={styles.typeScroller} aria-label="Loại thông báo">
          <button
            type="button"
            className={`${styles.typeChip} ${
              selectedType ? "" : styles.typeChipActive
            }`}
            onClick={() => handleTypeChange(undefined)}
          >
            Tất cả loại
          </button>
          {notificationTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={`${styles.typeChip} ${
                selectedType === type ? styles.typeChipActive : ""
              }`}
              onClick={() => handleTypeChange(type)}
            >
              {NotificationTypeLabel[type]}
            </button>
          ))}
        </div>
      </section>

      {isInitialLoading ? (
        <div className={styles.list} aria-busy="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={styles.skeletonCard} />
          ))}
        </div>
      ) : notificationsQuery.isError ? (
        <div className={styles.errorState}>
          <BellDot size={30} strokeWidth={2.1} />
          <h3>Không tải được thông báo</h3>
          <p>Vui lòng thử lại sau ít phút.</p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => void notificationsQuery.refetch()}
          >
            <RefreshCw size={17} strokeWidth={2.2} />
            Thử lại
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className={styles.emptyState}>
          <Bell size={30} strokeWidth={2.1} />
          <h3>Chưa có thông báo phù hợp</h3>
          <p>Thử đổi bộ lọc hoặc quay lại sau khi hệ thống gửi thông báo mới.</p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.notificationRecipientId}
                notification={notification}
                onOpen={handleOpenNotification}
              />
            ))}
          </div>

          {notificationsQuery.hasNextPage ? (
            <div className={styles.footerAction}>
              <button
                type="button"
                className={styles.loadMoreButton}
                disabled={notificationsQuery.isFetchingNextPage}
                onClick={() => void notificationsQuery.fetchNextPage()}
              >
                {notificationsQuery.isFetchingNextPage
                  ? "Đang tải..."
                  : "Xem thêm"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default NotificationPage;
