import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  UserCheck,
  Users,
} from "lucide-react";

export const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/coaches", label: "Quản lý HLV", icon: UserCheck },
  { path: "/students", label: "Quản lý Học Viên", icon: Users },
  { path: "/schedules", label: "Lịch Học", icon: CalendarDays },
  { path: "/attendance", label: "Điểm Danh", icon: ClipboardList },
];
