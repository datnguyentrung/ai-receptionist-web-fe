export const AUTH_SESSION_INVALID_EVENT = "auth:session-invalid";

export const notifyAuthSessionInvalid = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_SESSION_INVALID_EVENT));
};
