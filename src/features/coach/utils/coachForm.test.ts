import { describe, expect, it } from "vitest";
import {
  formatDateInput,
  getRequestErrorMessage,
  isFutureDate,
} from "./coachForm";

describe("coachForm", () => {
  it("formats supported date values for an input", () => {
    expect(formatDateInput("2026-07-25T08:00:00Z")).toBe("2026-07-25");
    expect(formatDateInput(new Date("2026-07-25T08:00:00Z"))).toBe("2026-07-25");
    expect(formatDateInput(null)).toBe("");
  });

  it("rejects future birth dates", () => {
    expect(isFutureDate("2999-01-01")).toBe(true);
    expect(isFutureDate("2000-01-01")).toBe(false);
  });

  it("prefers the API response message when a mutation fails", () => {
    expect(
      getRequestErrorMessage(
        { response: { data: { message: "HLV đã tồn tại" } } },
        "Không thể cập nhật huấn luyện viên.",
      ),
    ).toBe("HLV đã tồn tại");
  });
});
