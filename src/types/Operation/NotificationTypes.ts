import type { PageResponse } from "@/types/pagination";

export type NotificationRecipientStatus =
  | "PENDING"
  | "SENT"
  | "FAILED"
  | "ARCHIVED";

export type NotificationType =
  | "SYSTEM"
  | "ATTENDANCE"
  | "TUITION"
  | "CLASS_SCHEDULE"
  | "COACH_TIMESHEET"
  | "ANNOUNCEMENT";

export type NotificationSortBy =
  | "createdAt"
  | "readAt"
  | "deliveredAt"
  | "updatedAt"
  | "recipientStatus"
  | "read";

export type NotificationSortDir = "asc" | "desc";

export interface NotificationRecipientResponse {
  notificationRecipientId: string;
  notificationId: string;
  recipientUserId: string;
  title: string;
  body: string;
  notificationType: NotificationType;
  referenceType: string | null;
  referenceId: string | null;
  payload: string | null;
  read: boolean;
  readAt: string | null;
  deliveredAt: string | null;
  recipientStatus: NotificationRecipientStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecipientListResponse {
  unreadCount: number;
  notifications: PageResponse<NotificationRecipientResponse>;
}

export interface NotificationFilters {
  read?: boolean;
  search?: string;
  type?: NotificationType;
  size?: number;
  sortBy?: NotificationSortBy;
  sortDir?: NotificationSortDir;
}

export interface NotificationListParams extends NotificationFilters {
  page?: number;
}
