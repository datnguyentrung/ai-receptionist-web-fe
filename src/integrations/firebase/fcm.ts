import { messaging, vapidKey } from "@/integrations/firebase/client";
import { javaApi } from "@/lib/axiosInstance";
import {
  getToken,
  isSupported,
  onMessage as onFcmMessage,
} from "firebase/messaging";

const FCM_TOKEN_KEY = "fcm_token";

type ExtendedNotificationOptions = NotificationOptions & {
  // badge?: string;
  tag?: string;
  renotify?: boolean;
  requireInteraction?: boolean;
};

const NOTIFICATION_ICON = `${window.location.origin}/logo/android/launchericon-192x192.png?v=2`;

let unsubscribeForegroundListener: (() => void) | null = null;

const saveTokenLocal = (token: string) => {
  try {
    localStorage.setItem(FCM_TOKEN_KEY, token);
  } catch {
    /* no-op */
  }
};

const getTokenLocal = (): string | null => {
  try {
    return localStorage.getItem(FCM_TOKEN_KEY);
  } catch {
    return null;
  }
};

const deleteTokenLocal = () => {
  try {
    localStorage.removeItem(FCM_TOKEN_KEY);
  } catch {
    /* no-op */
  }
};

const getRefreshTokenLocal = (): string | null => {
  try {
    return localStorage.getItem("refresh_token");
  } catch {
    return null;
  }
};

const getSWRegistration =
  async (): Promise<ServiceWorkerRegistration | null> => {
    if (!("serviceWorker" in navigator)) {
      console.warn("[FCM] Trình duyệt không hỗ trợ Service Worker.");
      return null;
    }

    const firebaseConfig: Record<string, string> = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId:
        import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
    };

    const swParams = new URLSearchParams(firebaseConfig).toString();

    return navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${swParams}`,
    );
  };

const sendTokenToServer = async (fcmToken: string) => {
  try {
    const refreshToken = getRefreshTokenLocal();

    if (!refreshToken) {
      console.warn("[FCM] Không gửi token lên BE vì thiếu refresh_token.");
      return;
    }

    await javaApi.post("/notifications/update-fcm", {
      fcmToken,
      refreshToken,
    });

    console.log("[FCM] Đã cập nhật FCM Token lên server thành công!");
  } catch (error) {
    console.error("[FCM] Gửi FCM token lên server thất bại:", error);
  }
};

const removeTokenFromServer = async () => {
  const token = getTokenLocal();
  if (!token) return;

  try {
    await javaApi.delete(`/notifications/fcm-token/${token}`);
  } catch {
    /* no-op: token có thể đã hết hạn hoặc đã bị xóa */
  }

  deleteTokenLocal();
};

export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  if (!messaging || !vapidKey) {
    console.warn("[FCM] Firebase Messaging hoặc VAPID key chưa được cấu hình.");
    return null;
  }

  if (!("Notification" in window)) {
    console.warn("[FCM] Trình duyệt không hỗ trợ Notification API.");
    return null;
  }

  const permission = await Notification.requestPermission();

  console.log("[FCM] Notification permission:", permission);

  if (permission !== "granted") {
    console.log("[FCM] Người dùng từ chối thông báo push.");
    return null;
  }

  try {
    const registration = await getSWRegistration();
    if (!registration) return null;

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    console.log("[FCM] Lấy FCM token thành công:", {
      tokenLength: token.length,
      tokenPreview: `${token.slice(0, 12)}...`,
    });

    await sendTokenToServer(token);
    saveTokenLocal(token);

    return token;
  } catch (error) {
    console.error("[FCM] Lấy FCM token thất bại:", error);
    return null;
  }
};

export const initFcmForegroundListener = () => {
  if (!messaging) return;

  if (unsubscribeForegroundListener) {
    return;
  }

  unsubscribeForegroundListener = onFcmMessage(messaging, async (payload) => {
    const title = payload.data?.title || payload.notification?.title;

    if (!title) {
      console.warn("[FCM] Foreground message không có title:", payload);
      return;
    }

    const body = payload.data?.body || payload.notification?.body || "";

    const clickUrl = payload.data?.clickUrl || payload.data?.url || "/";

    const options: ExtendedNotificationOptions = {
      body,
      icon:
        payload.data?.icon || payload.notification?.icon || NOTIFICATION_ICON,
      // badge: payload.data?.badge || "/logo/android/launchericon-96x96.png",
      data: {
        clickUrl,
        ...payload.data,
      },
      tag: payload.data?.tag || "attendance-notification",
      renotify: true,
      requireInteraction: true,
      silent: false,
    };

    try {
      if (!("serviceWorker" in navigator)) {
        console.warn(
          "[FCM] Không hỗ trợ Service Worker nên không hiển thị notification.",
        );
        return;
      }

      if (!("Notification" in window)) {
        console.warn("[FCM] Không hỗ trợ Notification API.");
        return;
      }

      if (Notification.permission !== "granted") {
        console.warn(
          "[FCM] Chưa được cấp quyền notification:",
          Notification.permission,
        );
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification(title, options);

      console.log(
        "[FCM] Đã hiển thị foreground notification qua Service Worker.",
      );
    } catch (error) {
      console.error("[FCM] Không thể hiển thị foreground notification:", error);
    }
  });
};

export const syncFcmToken = async () => {
  if (!messaging || !vapidKey) return;

  if (!("Notification" in window)) return;

  if (Notification.permission !== "granted") {
    console.log("[FCM] Chưa được cấp quyền notification, bỏ qua sync token.");
    return;
  }

  try {
    const registration = await getSWRegistration();
    if (!registration) return;

    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    const savedToken = getTokenLocal();

    if (!savedToken || savedToken !== currentToken) {
      await sendTokenToServer(currentToken);
      saveTokenLocal(currentToken);
    }
  } catch (error) {
    console.error("[FCM] Sync FCM token thất bại:", error);
  }
};

export const cleanupFcm = async () => {
  try {
    if (messaging) {
      const { deleteToken } = await import("firebase/messaging");
      await deleteToken(messaging);
    }
  } catch {
    /* no-op */
  }

  await removeTokenFromServer();
};

export const initFcm = async (): Promise<boolean> => {
  const supported = await isSupported();

  if (!supported) {
    console.log("[FCM] Trình duyệt không hỗ trợ FCM.");
    return false;
  }

  initFcmForegroundListener();

  return true;
};
