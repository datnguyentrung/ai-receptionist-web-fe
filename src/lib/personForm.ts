export function formatDateInput(value?: string | Date | null): string {
  if (!value) {
    return "";
  }

  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
}

export function isFutureDate(value: string): boolean {
  if (!value) {
    return false;
  }

  const today = new Date();
  const date = new Date(value);
  const safeToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const safeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return safeDate > safeToday;
}

export function getRequestErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (!error) {
    return fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error !== "object") {
    return fallbackMessage;
  }

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
