export const AUTH_STORAGE_VERSION = "auth-storage-v2";

const LEGACY_AUTH_KEYS = [
  "refreshToken",
  "refresh_token",
  "token",
  "access_token",
  "user",
  "role",
  "idRole",
  "idUser",
  "idAccount",
  "userCode",
  "currentUser",
  "authData",
] as const;

export const removeLegacyAuthStorage = () => {
  if (typeof window === "undefined") return;

  for (const key of LEGACY_AUTH_KEYS) {
    try {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    } catch {
      /* storage may be unavailable */
    }
  }

  try {
    window.localStorage.setItem(AUTH_STORAGE_VERSION, "2");
  } catch {
    /* storage may be unavailable */
  }
};

export const clearAuthCompatibilityStorage = () => {
  removeLegacyAuthStorage();
};
