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
  },
  {
    path: "/coaches",
    label: "Đội ngũ HLV",
    icon: UserRoundCheck,
  },
  {
    path: "/students",
    label: "Hồ sơ Võ sinh",
    icon: Users,
  },
  {
    path: "/schedules",
    label: "Lịch tập & Lớp học",
    icon: CalendarRange,
  },
  {
    path: "/history",
    label: "Nhật ký điểm danh",
    icon: History,
  },
  {
    path: "/ai/check-in",
    label: "Trợ lý AI Check-in",
    icon: ScanFace,
  },
];
