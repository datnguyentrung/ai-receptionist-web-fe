import type { Belt, CoachStatus } from "@/config/constants";

export const COACH_BELT_OPTIONS: Belt[] = [
  "C10", "C9", "C8", "C7", "C6", "C5", "C4", "C3", "C2", "C1",
  "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10",
];

export const COACH_STATUS_OPTIONS: Array<{
  value: CoachStatus;
  label: string;
}> = [
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Tạm nghỉ" },
  { value: "SUSPENDED", label: "Đình chỉ" },
  { value: "RETIRED", label: "Đã nghỉ hưu" },
];

export function formatDateInput(value?: string | Date | null) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
}

export function isFutureDate(value: string) {
  if (!value) return false;

  const today = new Date();
  const date = new Date(value);
  const safeToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const safeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return safeDate > safeToday;
}

export function getRequestErrorMessage(error: unknown, fallbackMessage: string) {
  if (!error) return fallbackMessage;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error !== "object") return fallbackMessage;

  const maybeError = error as {
    message?: unknown;
    response?: { data?: { message?: unknown; error?: unknown } };
  };
  const responseMessage = maybeError.response?.data?.message;
  const responseError = maybeError.response?.data?.error;

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }
  if (typeof responseError === "string" && responseError.trim()) {
    return responseError;
  }
  if (typeof maybeError.message === "string" && maybeError.message.trim()) {
    return maybeError.message;
  }

  return fallbackMessage;
}
