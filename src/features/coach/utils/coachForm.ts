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
