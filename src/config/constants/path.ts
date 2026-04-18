import { ROLE_LEVELS } from "@/config/constants/roleLevels";
import {
  CalendarRange,
  History,
  LayoutDashboard,
  ScanFace,
  UserRoundCheck,
  Users,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    path: "/",
    label: "Tổng quan",
    icon: LayoutDashboard,
    minLevel: ROLE_LEVELS.MANAGER_SENIOR,
  },
  {
    path: "/coaches",
    label: "Đội ngũ HLV",
    icon: UserRoundCheck,
    minLevel: ROLE_LEVELS.MANAGER_SENIOR,
  },
  {
    path: "/students",
    label: "Hồ sơ Võ sinh",
    icon: Users,
    minLevel: ROLE_LEVELS.COACH,
  },
  {
    path: "/schedules",
    label: "Lịch tập & Lớp học",
    icon: CalendarRange,
    minLevel: ROLE_LEVELS.COACH,
  },
  {
    path: "/history",
    label: "Nhật ký điểm danh",
    icon: History,
    minLevel: ROLE_LEVELS.COACH,
  },
  {
    path: "/ai/check-in",
    label: "Trợ lý AI Check-in",
    icon: ScanFace,
    minLevel: ROLE_LEVELS.STUDENT,
  },
  {
    path: "/public/exam",
    label: "Quản lý Khảo thí",
    icon: ScanFace,
  },
];
