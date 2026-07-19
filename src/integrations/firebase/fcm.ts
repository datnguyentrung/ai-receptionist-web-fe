import { authApi } from "@/features/auth/api/authApi";
import { getFirebaseMessaging, vapidKey } from "@/integrations/firebase/client";
import { javaApi } from "@/lib/axiosInstance";
import { getAuthAccessToken } from "@/store/authStore";
import { getToken, onMessage as onFcmMessage } from "firebase/messaging";

const FCM_TOKEN_KEY = "fcm_token";

type ExtendedNotificationOptions = NotificationOptions & {
  // badge?: string;
  tag?: string;
  renotify?: boolean;
  requireInteraction?: boolean;
};

type FcmTokenRequestOptions = {
  requestPermission: boolean;
};

const NOTIFICATION_ICON = `${window.location.origin}/logo/android/launchericon-192x192.png?v=2`;

let unsubscribeForegroundListener: (() => void) | null = null;
let isForegroundListenerInitializing = false;
let fcmSyncPromise: Promise<void> | null = null;

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

const getNotificationPermission = async ({
  requestPermission,
}: FcmTokenRequestOptions): Promise<NotificationPermission | null> => {
  if (!("Notification" in window)) {
    console.warn("[FCM] Browser does not support the Notification API.");
    return null;
  }

  if (Notification.permission !== "default") {
    return Notification.permission;
  }

  if (!requestPermission) {
    return Notification.permission;
  }

  return Notification.requestPermission();
};

const getSWRegistration =
  async (): Promise<ServiceWorkerRegistration | null> => {
    if (!("serviceWorker" in navigator)) {
      console.warn("[FCM] Browser does not support Service Worker.");
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

export const removeFcmTokenFromServer = async () => {
  const token = getTokenLocal();
  if (!token) return;

  try {
    await javaApi.delete(`/notifications/fcm-token/${token}`);
  } catch {
    /* no-op: token may already be expired or removed */
  }
};

const getCurrentFcmToken = async (
  options: FcmTokenRequestOptions,
): Promise<string | null> => {
  if (!vapidKey) {
    console.log("[FCM] token sync skipped: VAPID key is not configured.");
    return null;
  }

  if (!("serviceWorker" in navigator)) {
    console.log("[FCM] token sync skipped: Service Worker is not available.");
    return null;
  }

  if (!("PushManager" in window)) {
    console.log("[FCM] token sync skipped: Push API is not available.");
    return null;
  }

  const permission = await getNotificationPermission(options);

  if (permission !== "granted") {
    console.log("[FCM] token sync skipped: notification permission not granted.");
    return null;
  }

  const fcmMessaging = await getFirebaseMessaging();
  if (!fcmMessaging) {
    console.log("[FCM] token sync skipped: Firebase Messaging is unavailable.");
    return null;
  }

  const registration = await getSWRegistration();
  if (!registration) return null;

  const token = await getToken(fcmMessaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    console.log("[FCM] token sync skipped: no registration token.");
    return null;
  }

  console.log("[FCM] token acquired.");

  return token;
};

const runFcmTokenSync = (getTokenForSync: () => Promise<string | null>) => {
  if (fcmSyncPromise) {
    return fcmSyncPromise;
  }

  fcmSyncPromise = (async () => {
    if (!getAuthAccessToken()) {
      console.log("[FCM] token sync skipped: unauthenticated.");
      return;
    }

    const currentToken = await getTokenForSync();
    if (!currentToken) return;

    await authApi.updateFcm(currentToken);
    saveTokenLocal(currentToken);
    console.log("[FCM] token synced.");
  })()
    .catch((error) => {
      console.error("[FCM] token sync failed.");
      throw error;
    })
    .finally(() => {
      fcmSyncPromise = null;
    });

  return fcmSyncPromise;
};

export const ensureFcmTokenSynced = async (): Promise<void> =>
  runFcmTokenSync(() => getCurrentFcmToken({ requestPermission: false }));

export const requestFcmTokenForLogin = async (): Promise<string | null> => {
  try {
    return await getCurrentFcmToken({ requestPermission: true });
  } catch {
    console.error("[FCM] token sync failed.");
    return null;
  }
};

export const requestNotificationPermission = async (): Promise<string | null> => {
  const token = await getCurrentFcmToken({ requestPermission: true });

  if (!token) {
    return null;
  }

  await runFcmTokenSync(async () => token);

  return token;
};

export const initFcmForegroundListener = async () => {
  if (unsubscribeForegroundListener || isForegroundListenerInitializing) {
    return;
  }

  isForegroundListenerInitializing = true;

  try {
    const fcmMessaging = await getFirebaseMessaging();
    if (!fcmMessaging) {
      return;
    }

    if (unsubscribeForegroundListener) {
      return;
    }

    unsubscribeForegroundListener = onFcmMessage(
      fcmMessaging,
      async (payload) => {
        const title = payload.data?.title || payload.notification?.title;

        if (!title) {
          console.warn("[FCM] Foreground message has no title:", payload);
          return;
        }

        const body = payload.data?.body || payload.notification?.body || "";
        const clickUrl = payload.data?.clickUrl || payload.data?.url || "/";

        const options: ExtendedNotificationOptions = {
          body,
          icon:
            payload.data?.icon ||
            payload.notification?.icon ||
            NOTIFICATION_ICON,
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
            console.warn("[FCM] Service Worker is not available.");
            return;
          }

          if (!("Notification" in window)) {
            console.warn("[FCM] Notification API is not available.");
            return;
          }

          if (Notification.permission !== "granted") {
            console.warn(
              "[FCM] Notification permission has not been granted:",
              Notification.permission,
            );
            return;
          }

          const registration = await navigator.serviceWorker.ready;

          await registration.showNotification(title, options);

          console.log(
            "[FCM] Foreground notification displayed via Service Worker.",
          );
        } catch (error) {
          console.error("[FCM] Failed to display foreground notification:", error);
        }
      },
    );
  } finally {
    isForegroundListenerInitializing = false;
  }
};

export const syncFcmToken = ensureFcmTokenSynced;

export const cleanupFcm = async () => {
  try {
    const fcmMessaging = await getFirebaseMessaging();
    if (fcmMessaging) {
      const { deleteToken } = await import("firebase/messaging");
      await deleteToken(fcmMessaging);
    }
  } catch {
    /* no-op */
  }

  deleteTokenLocal();
};

export const initFcm = async (): Promise<boolean> => {
  const fcmMessaging = await getFirebaseMessaging();

  if (!fcmMessaging) {
    console.log("[FCM] Browser does not support FCM.");
    return false;
  }

  await initFcmForegroundListener();

  return true;
};
