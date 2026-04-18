export type Belt =
  | "C10"
  | "C9"
  | "C8"
  | "C7"
  | "C6"
  | "C5"
  | "C4"
  | "C3"
  | "C2"
  | "C1"
  | "D1"
  | "D2"
  | "D3"
  | "D4"
  | "D5"
  | "D6"
  | "D7"
  | "D8"
  | "D9"
  | "D10";

export type BranchStatus = "OPERATING" | "CLOSED" | "MAINTENANCE";

export type CoachStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "RETIRED";

// ---------------------------------------------------------------------------
// ScheduleLevel
// ---------------------------------------------------------------------------
export type ScheduleLevel =
  | "BASIC"
  | "ADVANCED"
  | "KID"
  | "ADULT"
  | "ASSISTANT"
  | "PERFORMANCE"
  | "DAN"
  | "SKILL"
  | "SPARRING_TEAM_TIER_1"
  | "SPARRING_TEAM_TIER_2"
  | "SPARRING_TEAM_TIER_3"
  | "FORMS_TEAM_TIER_1"
  | "FORMS_TEAM_TIER_2"
  | "FORMS_TEAM_TIER_3";

export const ScheduleLevelLabel: Record<ScheduleLevel, string> = {
  BASIC: "Lớp Cơ Bản",
  ADVANCED: "Lớp Nâng Cao",
  KID: "Lớp Kid",
  ADULT: "Lớp Người Lớn",
  ASSISTANT: "Lớp Trợ Giảng",
  PERFORMANCE: "Lớp Biểu Diễn",
  DAN: "Lớp Đẳng",
  SKILL: "Lớp Kỹ Năng",
  // Đội tuyển đối kháng (Sparring/Kumite)
  SPARRING_TEAM_TIER_1: "Đội Tuyển Đối Kháng Tuyến 1",
  SPARRING_TEAM_TIER_2: "Đội Tuyển Đối Kháng Tuyến 2",
  SPARRING_TEAM_TIER_3: "Đội Tuyển Đối Kháng Tuyến 3",
  // Đội tuyển quyền (Forms/Poomsae/Kata)
  FORMS_TEAM_TIER_1: "Đội Tuyển Quyền Tuyến 1",
  FORMS_TEAM_TIER_2: "Đội Tuyển Quyền Tuyến 2",
  FORMS_TEAM_TIER_3: "Đội Tuyển Quyền Tuyến 3",
};

// ---------------------------------------------------------------------------
// ScheduleLocation
// ---------------------------------------------------------------------------
export type ScheduleLocation = "INDOOR" | "OUTDOOR" | "ONLINE";

export const ScheduleLocationLabel: Record<ScheduleLocation, string> = {
  INDOOR: "Phòng tập",
  OUTDOOR: "Ngoài trời",
  ONLINE: "Trực tuyến",
};

// ---------------------------------------------------------------------------
// ScheduleShift
// ---------------------------------------------------------------------------
export type ScheduleShift = "CA_1" | "CA_2";

export const ScheduleShiftLabel: Record<ScheduleShift, string> = {
  CA_1: "Ca 1",
  CA_2: "Ca 2",
};

// ---------------------------------------------------------------------------
// ScheduleStatus
// ---------------------------------------------------------------------------
export type ScheduleStatus =
  | "ACTIVE" // Hoạt động
  | "INACTIVE"; // Không hoạt động

// ---------------------------------------------------------------------------
// StudentStatus
// ---------------------------------------------------------------------------
export type StudentStatus =
  | "ACTIVE" // Hoạt động
  | "RESERVED" // Bảo lưu
  | "DROPPED"; // Nghỉ học

// ---------------------------------------------------------------------------
// Weekday
// ---------------------------------------------------------------------------
export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

/** Mã số lưu trong DB (tương ứng Java enum code) */
export const WeekdayCode: Record<Weekday, number> = {
  MONDAY: 2,
  TUESDAY: 3,
  WEDNESDAY: 4,
  THURSDAY: 5,
  FRIDAY: 6,
  SATURDAY: 7,
  SUNDAY: 1,
};

/** Nhãn hiển thị UI */
export const WeekdayLabel: Record<Weekday, string> = {
  /* `MONDAY` is a constant representing the weekday Monday in the Weekday enum
  type. It is used to define and identify Monday within the context of
  scheduling and organizing activities based on weekdays. */
  MONDAY: "Thứ Hai",
  TUESDAY: "Thứ Ba",
  WEDNESDAY: "Thứ Tư",
  THURSDAY: "Thứ Năm",
  FRIDAY: "Thứ Sáu",
  SATURDAY: "Thứ Bảy",
  SUNDAY: "Chủ Nhật",
};

export const WeekdayCodeToLabel: Record<number, string> = {
  1: "Chủ Nhật",
  2: "Thứ Hai",
  3: "Thứ Ba",
  4: "Thứ Tư",
  5: "Thứ Năm",
  6: "Thứ Sáu",
  7: "Thứ Bảy",
};

/** Tra cứu Weekday theo code (O(1), tương đương fromCode() bên Java) */
export const WeekdayFromCode = Object.entries(WeekdayCode).reduce(
  (acc, [day, code]) => {
    acc[code] = day as Weekday;
    return acc;
  },
  {} as Record<number, Weekday>,
);
