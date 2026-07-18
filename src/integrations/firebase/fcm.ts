import { authApi } from "@/features/auth/api/authApi";
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

const getSWRegistration =
  async (): Promise<ServiceWorkerRegistration | null> => {
    if (!("serviceWorker" in navigator)) {
      console.warn("[FCM] TrÃ¬nh duyá»‡t khÃ´ng há»— trá»£ Service Worker.");
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
    await authApi.updateFcm(fcmToken);
    console.log("[FCM] Da cap nhat FCM token cho session hien tai.");
  } catch (error) {
    console.error("[FCM] Gui FCM token len server that bai:", error);
  }
};

const removeTokenFromServer = async () => {
  const token = getTokenLocal();
  if (!token) return;

  try {
    await javaApi.delete(`/notifications/fcm-token/${token}`);
  } catch {
    /* no-op: token cÃ³ thá»ƒ Ä‘Ã£ háº¿t háº¡n hoáº·c Ä‘Ã£ bá»‹ xÃ³a */
  }

  deleteTokenLocal();
};

export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  if (!messaging || !vapidKey) {
    console.warn("[FCM] Firebase Messaging hoáº·c VAPID key chÆ°a Ä‘Æ°á»£c cáº¥u hÃ¬nh.");
    return null;
  }

  if (!("Notification" in window)) {
    console.warn("[FCM] TrÃ¬nh duyá»‡t khÃ´ng há»— trá»£ Notification API.");
    return null;
  }

  const permission = await Notification.requestPermission();

  console.log("[FCM] Notification permission:", permission);

  if (permission !== "granted") {
    console.log("[FCM] NgÆ°á»i dÃ¹ng tá»« chá»‘i thÃ´ng bÃ¡o push.");
    return null;
  }

  try {
    const registration = await getSWRegistration();
    if (!registration) return null;

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    await sendTokenToServer(token);
    saveTokenLocal(token);

    return token;
  } catch (error) {
    console.error("[FCM] Láº¥y FCM token tháº¥t báº¡i:", error);
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
      console.warn("[FCM] Foreground message khÃ´ng cÃ³ title:", payload);
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
          "[FCM] KhÃ´ng há»— trá»£ Service Worker nÃªn khÃ´ng hiá»ƒn thá»‹ notification.",
        );
        return;
      }

      if (!("Notification" in window)) {
        console.warn("[FCM] KhÃ´ng há»— trá»£ Notification API.");
        return;
      }

      if (Notification.permission !== "granted") {
        console.warn(
          "[FCM] ChÆ°a Ä‘Æ°á»£c cáº¥p quyá»n notification:",
          Notification.permission,
        );
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification(title, options);

      console.log(
        "[FCM] ÄÃ£ hiá»ƒn thá»‹ foreground notification qua Service Worker.",
      );
    } catch (error) {
      console.error("[FCM] KhÃ´ng thá»ƒ hiá»ƒn thá»‹ foreground notification:", error);
    }
  });
};

export const syncFcmToken = async () => {
  if (!messaging || !vapidKey) return;

  if (!("Notification" in window)) return;

  if (Notification.permission !== "granted") {
    console.log("[FCM] ChÆ°a Ä‘Æ°á»£c cáº¥p quyá»n notification, bá» qua sync token.");
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
    console.error("[FCM] Sync FCM token tháº¥t báº¡i:", error);
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
    console.log("[FCM] TrÃ¬nh duyá»‡t khÃ´ng há»— trá»£ FCM.");
    return false;
  }

  initFcmForegroundListener();

  return true;
};
