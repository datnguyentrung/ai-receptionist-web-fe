import { javaApi } from "@/lib/axiosInstance";
import { ensurePageResponse } from "@/lib/runtimeGuards";
import type {
  NotificationListParams,
  NotificationRecipientListResponse,
  NotificationRecipientResponse,
} from "@/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function ensureNotificationRecipientListResponse(
  value: unknown,
  context: string,
): NotificationRecipientListResponse {
  if (isRecord(value)) {
    return {
      unreadCount: typeof value.unreadCount === "number" ? value.unreadCount : 0,
      notifications: ensurePageResponse<NotificationRecipientResponse>(
        value.notifications,
        `${context}.notifications`,
      ),
    };
  }

  console.warn(`[runtime-guard] ${context}: expected notification list`, value);
  return {
    unreadCount: 0,
    notifications: ensurePageResponse<NotificationRecipientResponse>(
      undefined,
      `${context}.notifications`,
    ),
  };
}

export const notificationAPI = {
  getMine: async (
    params: NotificationListParams = {},
  ): Promise<NotificationRecipientListResponse> => {
    const response = await javaApi.get("/notification-recipients", { params });
    return ensureNotificationRecipientListResponse(
      response.data,
      "notificationAPI.getMine",
    );
  },

  getDetail: async (
    notificationRecipientId: string,
  ): Promise<NotificationRecipientResponse> => {
    const response = await javaApi.get(
      `/notification-recipients/${notificationRecipientId}`,
    );
    return response.data as NotificationRecipientResponse;
  },

  markRead: async (notificationRecipientId: string): Promise<void> => {
    await javaApi.patch(
      `/notification-recipients/${notificationRecipientId}/read`,
    );
  },
};
