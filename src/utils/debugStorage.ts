export function writeDebugStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;

  try {
    if (window.localStorage.getItem("debug_ai_checkin") !== "1") return;

    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...((value && typeof value === "object" ? value : { value }) as Record<
          string,
          unknown
        >),
        at: new Date().toISOString(),
      }),
    );
  } catch {
    // Debug logging must never affect the app flow.
  }
}
