// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  accessToken: "access-token" as string | null,
  deleteFcmToken: vi.fn(),
  getFirebaseMessaging: vi.fn(),
  getToken: vi.fn(),
  onMessage: vi.fn(),
  registerServiceWorker: vi.fn(),
  updateFcm: vi.fn(),
}));

vi.mock("@/features/auth/api/authApi", () => ({
  authApi: {
    updateFcm: mocks.updateFcm,
  },
}));

vi.mock("@/integrations/firebase/client", () => ({
  getFirebaseMessaging: mocks.getFirebaseMessaging,
  vapidKey: "test-vapid-key",
}));

vi.mock("@/lib/axiosInstance", () => ({
  javaApi: {
    delete: vi.fn(),
  },
}));

vi.mock("@/store/authStore", () => ({
  getAuthAccessToken: () => mocks.accessToken,
}));

vi.mock("firebase/messaging", () => ({
  deleteToken: mocks.deleteFcmToken,
  getToken: mocks.getToken,
  onMessage: mocks.onMessage,
}));

function installNotification(
  permission: NotificationPermission,
  requestResult: NotificationPermission = permission,
) {
  let currentPermission = permission;
  const requestPermission = vi.fn(async () => {
    currentPermission = requestResult;
    return requestResult;
  });
  const MockNotification = function Notification() {} as unknown as typeof Notification;

  Object.defineProperty(MockNotification, "permission", {
    configurable: true,
    get: () => currentPermission,
  });
  Object.defineProperty(MockNotification, "requestPermission", {
    configurable: true,
    value: requestPermission,
  });
  Object.defineProperty(window, "Notification", {
    configurable: true,
    value: MockNotification,
  });
  Object.defineProperty(globalThis, "Notification", {
    configurable: true,
    value: MockNotification,
  });

  return requestPermission;
}

function installPushAndServiceWorker() {
  Object.defineProperty(window, "PushManager", {
    configurable: true,
    value: function PushManager() {},
  });

  const registration = {} as ServiceWorkerRegistration;
  mocks.registerServiceWorker.mockResolvedValue(registration);

  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      ready: Promise.resolve(registration),
      register: mocks.registerServiceWorker,
    },
  });

  return registration;
}

async function importFcm() {
  return import("@/integrations/firebase/fcm");
}

async function waitForUpdateFcmCall() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (mocks.updateFcm.mock.calls.length > 0) return;
    await Promise.resolve();
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  }
}

describe("FCM token sync", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    mocks.accessToken = "access-token";
    mocks.deleteFcmToken.mockReset();
    mocks.getFirebaseMessaging.mockReset();
    mocks.getFirebaseMessaging.mockResolvedValue({ app: "firebase" });
    mocks.getToken.mockReset();
    mocks.getToken.mockResolvedValue("firebase-token");
    mocks.onMessage.mockReset();
    mocks.registerServiceWorker.mockReset();
    mocks.updateFcm.mockReset();
    mocks.updateFcm.mockResolvedValue(undefined);

    localStorage.clear();
    installNotification("granted");
    installPushAndServiceWorker();
  });

  it("syncs with the backend even when localStorage already has the same token", async () => {
    localStorage.setItem("fcm_token", "firebase-token");
    const { ensureFcmTokenSynced } = await importFcm();

    await ensureFcmTokenSynced();

    expect(mocks.updateFcm).toHaveBeenCalledTimes(1);
    expect(mocks.updateFcm).toHaveBeenCalledWith("firebase-token");
    expect(localStorage.getItem("fcm_token")).toBe("firebase-token");
  });

  it("syncs after bootstrap when localStorage has a token but the backend may be null", async () => {
    localStorage.setItem("fcm_token", "cached-token");
    const { ensureFcmTokenSynced } = await importFcm();

    await ensureFcmTokenSynced();

    expect(mocks.updateFcm).toHaveBeenCalledTimes(1);
    expect(mocks.updateFcm).toHaveBeenCalledWith("firebase-token");
    expect(localStorage.getItem("fcm_token")).toBe("firebase-token");
  });

  it("does not call the backend when notification permission is denied", async () => {
    installNotification("denied");
    const { ensureFcmTokenSynced } = await importFcm();

    await ensureFcmTokenSynced();

    expect(mocks.getToken).not.toHaveBeenCalled();
    expect(mocks.updateFcm).not.toHaveBeenCalled();
  });

  it("does not request permission or call the backend during bootstrap when permission is default", async () => {
    const requestPermission = installNotification("default", "granted");
    const { ensureFcmTokenSynced } = await importFcm();

    await ensureFcmTokenSynced();

    expect(requestPermission).not.toHaveBeenCalled();
    expect(mocks.getToken).not.toHaveBeenCalled();
    expect(mocks.updateFcm).not.toHaveBeenCalled();
  });

  it("does not call the backend when the user is unauthenticated", async () => {
    mocks.accessToken = null;
    const { ensureFcmTokenSynced } = await importFcm();

    await ensureFcmTokenSynced();

    expect(mocks.getToken).not.toHaveBeenCalled();
    expect(mocks.updateFcm).not.toHaveBeenCalled();
  });

  it("deduplicates concurrent sync calls", async () => {
    let resolveUpdate: () => void = () => {};
    mocks.updateFcm.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      }),
    );
    const { ensureFcmTokenSynced } = await importFcm();

    const firstSync = ensureFcmTokenSynced();
    const secondSync = ensureFcmTokenSynced();

    await waitForUpdateFcmCall();
    expect(mocks.updateFcm).toHaveBeenCalledTimes(1);

    resolveUpdate();
    await Promise.all([firstSync, secondSync]);
  });

  it("does not save the token locally when backend sync fails and releases the lock", async () => {
    mocks.updateFcm.mockRejectedValueOnce(new Error("sync failed"));
    const { ensureFcmTokenSynced } = await importFcm();

    await expect(ensureFcmTokenSynced()).rejects.toThrow("sync failed");
    expect(localStorage.getItem("fcm_token")).toBeNull();

    await ensureFcmTokenSynced();

    expect(mocks.updateFcm).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem("fcm_token")).toBe("firebase-token");
  });

  it("syncs and stores a new Firebase token when the token changes", async () => {
    localStorage.setItem("fcm_token", "old-token");
    mocks.getToken.mockResolvedValue("new-token");
    const { ensureFcmTokenSynced } = await importFcm();

    await ensureFcmTokenSynced();

    expect(mocks.updateFcm).toHaveBeenCalledWith("new-token");
    expect(localStorage.getItem("fcm_token")).toBe("new-token");
  });

  it("requests permission from a user action and syncs after permission becomes granted", async () => {
    const requestPermission = installNotification("default", "granted");
    const { requestNotificationPermission } = await importFcm();

    const token = await requestNotificationPermission();

    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(token).toBe("firebase-token");
    expect(mocks.updateFcm).toHaveBeenCalledWith("firebase-token");
  });

  it("gets a login token without saving localStorage or calling the backend before auth", async () => {
    mocks.accessToken = null;
    const { requestFcmTokenForLogin } = await importFcm();

    const token = await requestFcmTokenForLogin();

    expect(token).toBe("firebase-token");
    expect(mocks.updateFcm).not.toHaveBeenCalled();
    expect(localStorage.getItem("fcm_token")).toBeNull();
  });
});
