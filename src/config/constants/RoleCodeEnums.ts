/**
 * RoleCode types and labels for coaches
 * Không được hard code - tất cả roleCode được định nghĩa ở đây
 */

export type CoachRoleCode =
  | "COACH_TRAINEE"
  | "COACH_JUNIOR"
  | "COACH_SENIOR"
  | "MANAGER_TRAINEE"
  | "MANAGER_MIDDLE"
  | "MANAGER_SENIOR"
  | "HEAD_COACH";

/**
 * Mapping từ roleCode sang tên hiển thị (Vietnamese labels)
 */
export const COACH_ROLE_CODE_LABELS: Record<CoachRoleCode, string> = {
  COACH_TRAINEE: "Huấn luyện viên Thực tập",
  COACH_JUNIOR: "Huấn luyện viên Cấp trung",
  COACH_SENIOR: "Huấn luyện viên Cấp cao",
  MANAGER_TRAINEE: "Quản lý Thực tập",
  MANAGER_MIDDLE: "Quản lý Cấp trung",
  MANAGER_SENIOR: "Quản lý Cấp cao",
  HEAD_COACH: "Huấn luyện viên Trưởng",
};

/**
 * Thứ tự hiển thị của các roleCode
 */
export const COACH_ROLE_CODE_ORDER: CoachRoleCode[] = [
  "HEAD_COACH",
  "MANAGER_SENIOR",
  "MANAGER_MIDDLE",
  "MANAGER_TRAINEE",
  "COACH_SENIOR",
  "COACH_JUNIOR",
  "COACH_TRAINEE",
];
