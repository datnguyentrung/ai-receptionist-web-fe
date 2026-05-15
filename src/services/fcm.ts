import {
  getToken,
  isSupported,
  onMessage as onFcmMessage,
} from "firebase/messaging";
import { messaging, vapidKey } from "@/firebase";
import { javaApi } from "@/lib/axiosInstance";

const FCM_TOKEN_KEY = "fcm_token";

const saveTokenLocal = (token: string) => {
  try {
    localStorage.setItem(FCM_TOKEN_KEY, token);
  } catch {
    /* no-op */
  }
};

const getSWRegistration = async () => {
  if (!("serviceWorker" in navigator)) return null;

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  };

  const swParams = new URLSearchParams(firebaseConfig).toString();
  // Đăng ký đích danh kèm query string
  return navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?${swParams}`,
  );
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

// Sửa lại hàm nhận token, truyền thêm refreshToken vào
const sendTokenToServer = async (fcmToken: string) => {
  try {
    // 1. Lấy refreshToken đang lưu ở FE ra (ví dụ lấy từ localStorage hoặc AuthStore)
    const refreshToken = localStorage.getItem("refresh_token") || "";

    // 2. Gọi đúng URL và đúng cấu trúc Object mà BE Java đang chờ (UpdateFcmReq)
    await javaApi.post("/notifications/update-fcm", {
      // Nhớ thêm prefix như /auth nếu Class Controller có quy định
      fcmToken: fcmToken,
      refreshToken: refreshToken,
    });

    console.log("Đã cập nhật FCM Token lên server thành công!");
  } catch (error) {
    console.error("Gửi FCM token lên server thất bại:", error);
  }
};

const removeTokenFromServer = async () => {
  const token = getTokenLocal();
  if (!token) return;
  try {
    await javaApi.delete(`/notifications/fcm-token/${token}`);
  } catch {
    /* no-op: token có thể đã hết hạn */
  }
  deleteTokenLocal();
};

export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  if (!messaging || !vapidKey) {
    console.warn("Firebase Messaging hoặc VAPID key chưa được cấu hình.");
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.log("Người dùng từ chối thông báo push.");
    return null;
  }

  try {
    // SỬA TẠI ĐÂY: Lấy instance đăng ký SW truyền vào getToken
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
    console.error("Lấy FCM token thất bại:", error);
    return null;
  }
};

export const initFcmForegroundListener = () => {
  if (!messaging) return;

  onFcmMessage(messaging, (payload) => {
    const { title, body, icon } = payload.notification ?? {};
    if (!title) return;

    // Lấy link điều hướng giống như bên Service Worker
    const clickUrl = payload.data?.clickUrl || payload.data?.url || "/";

    const options: NotificationOptions = {
      body: body ?? "",
      icon: icon ?? "/assets/taekwondo.jpg",
      // Đóng gói clickUrl vào data để lúc click có cái mà dùng
      data: { clickUrl, ...payload.data },
    };

    const notification = new Notification(title, options);

    // BỔ SUNG: Xử lý khi người dùng click vào thông báo lúc đang mở App
    notification.onclick = (event) => {
      event.preventDefault(); // Ngăn hành vi mặc định của trình duyệt
      window.focus(); // Đưa tab web lên màn hình chính

      if (clickUrl && clickUrl !== "/") {
        // Nếu bạn dùng React Router, có thể điều hướng bằng router.navigate(clickUrl)
        // Hoặc dùng window.location nếu muốn reload/chuyển hướng cứng:
        window.location.href = clickUrl;
      }
    };
  });
};

export const syncFcmToken = async () => {
  if (!messaging || !vapidKey) return;

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
  } catch {
    /* token hết hạn hoặc bị từ chối — không cần xử lý */
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
  removeTokenFromServer();
};

export const initFcm = async (): Promise<boolean> => {
  const supported = await isSupported();
  if (!supported) {
    console.log("Trình duyệt không hỗ trợ FCM.");
    return false;
  }

  initFcmForegroundListener();
  return true;
};
