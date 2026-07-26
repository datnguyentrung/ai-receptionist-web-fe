import { describe, expect, it } from "vitest";
import { shouldResumeFaceScanning } from "./useFaceScanner";

describe("shouldResumeFaceScanning", () => {
  it("does not resume after a backend error until the user retries", () => {
    expect(
      shouldResumeFaceScanning({
        hasStarted: true,
        isSubmitting: false,
        status: "error",
      }),
    ).toBe(false);
  });

  it("resumes only after the terminal error state has been cleared", () => {
    expect(
      shouldResumeFaceScanning({
        hasStarted: true,
        isSubmitting: false,
        status: "scanning",
      }),
    ).toBe(true);
  });

  it("does not resume while a result is awaiting confirmation", () => {
    expect(
      shouldResumeFaceScanning({
        checkInResult: {
          audio_signal: "CHECKIN_SUCCESS",
          status: true,
          user: null,
          attendance_record: null,
        },
        hasStarted: true,
        isSubmitting: false,
        status: "scanning",
      }),
    ).toBe(false);
  });
});
