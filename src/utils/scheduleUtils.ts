import type { ScheduleShift, Weekday } from "@/config/constants";
import { WeekdayCode } from "@/config/constants";

type SessionType = "MORNING" | "AFTERNOON";

/**
 * Tạo mã lớp học tự động theo format: [A|P][branchId][weekday_code]C[shift_num]
 *
 * @param sessionType - Buổi học: "MORNING" (A) hoặc "AFTERNOON" (P)
 * @param branchId - ID chi nhánh (1-6)
 * @param weekday - Thứ trong tuần (MONDAY-SUNDAY)
 * @param shift - Ca học (CA_1 hoặc CA_2)
 * @returns Mã lớp học, ví dụ: "P14C1" (Chiều, cơ sở 1, thứ 4, ca 1)
 */
export const generateScheduleId = (
  sessionType: SessionType,
  branchId: number,
  weekday: Weekday,
  shift: ScheduleShift,
): string => {
  const sessionPrefix = sessionType === "MORNING" ? "A" : "P";
  const weekdayCode = WeekdayCode[weekday];
  const shiftNumber = shift === "CA_1" ? "1" : "2";

  return `${sessionPrefix}${branchId}${weekdayCode}C${shiftNumber}`;
};

/**
 * Kiểm tra xem có đủ dữ liệu để tạo mã lớp học không
 */
export const isScheduleIdReady = (
  sessionType: SessionType | null,
  branchId: number | null,
  weekday: Weekday | null,
  shift: ScheduleShift | null,
): boolean => {
  return !!(sessionType && branchId && weekday && shift);
};
