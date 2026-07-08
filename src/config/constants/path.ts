import { ROLE_LEVELS } from "@/config/constants/roleLevels";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bell,
  BookOpen,
  CalendarRange,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  History,
  House,
  Info,
  LayoutDashboard,
  ScanFace,
  Trophy,
  UserRoundCheck,
  Users,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  icon: LucideIcon;
  minLevel?: number;
  maxLevel?: number;
  id?: string;
  to?: string;
  display?: boolean;
};

export const NAV_ITEMS = ({
  studentCode,
}: { studentCode?: string } = {}): NavigationItem[] => [
  // Ví dụ thêm menu Trang cá nhân dùng đến studentCode
  {
    id: "personal-page",
    to: studentCode ? `/${studentCode}` : "/welcome",
    label: "Trang cá nhân",
    icon: UserRoundCheck, // Thay icon tùy ý bạn
    minLevel: ROLE_LEVELS.STUDENT, // Sửa lại level phù hợp
    display: true, // true: luôn hiển thị nếu studentCode có, false: ẩn nếu studentCode không có
  },
  {
    id: "classes",
    to: `/${studentCode}/classes`,
    label: "Lớp học",
    icon: BookOpen,
    minLevel: ROLE_LEVELS.STUDENT, // Sửa lại level phù hợp
    maxLevel: ROLE_LEVELS.PARENT, // Chỉ hiển thị cho phụ huynh
    display: false,
  },
  {
    id: "progress",
    to: `/${studentCode}/progress`,
    label: "Tiến trình",
    icon: Activity,
    minLevel: ROLE_LEVELS.STUDENT, // Sửa lại level phù hợp
    maxLevel: ROLE_LEVELS.PARENT, // Chỉ hiển thị cho phụ huynh
    display: false,
  },
  {
    id: "tuition",
    to: `/${studentCode}/tuition`,
    label: "Học phí",
    icon: CreditCard,
    minLevel: ROLE_LEVELS.STUDENT, // Sửa lại level phù hợp
    maxLevel: ROLE_LEVELS.PARENT, // Chỉ hiển thị cho phụ huynh
    display: false,
  },
  {
    id: "overview",
    to: "/",
    label: "Tổng quan",
    icon: LayoutDashboard,
    minLevel: ROLE_LEVELS.MANAGER_SENIOR,
  },
  {
    id: "coaches",
    to: "/coaches",
    label: "Đội ngũ HLV",
    icon: GraduationCap,
    minLevel: ROLE_LEVELS.MANAGER_SENIOR,
  },
  {
    id: "students",
    to: "/students",
    label: "Hồ sơ Võ sinh",
    icon: Users,
    minLevel: ROLE_LEVELS.COACH,
  },
  {
    id: "schedules",
    to: "/schedules",
    label: "Lịch tập & Lớp học",
    icon: CalendarRange,
    minLevel: ROLE_LEVELS.COACH,
  },
  {
    id: "history",
    to: "/history",
    label: "Nhật ký điểm danh",
    icon: History,
    minLevel: ROLE_LEVELS.COACH,
  },
  {
    id: "check-in",
    to: "/check-in",
    label: "Trợ lý AI Check-in",
    icon: ScanFace,
    minLevel: ROLE_LEVELS.DEVELOPER,
  },

  {
    id: "exam",
    to: "/public/exam",
    label: "Quản lý Khảo thí",
    icon: ClipboardCheck,
    // minLevel: ROLE_LEVELS.DEVELOPER,
  },
  {
    id: "rankings",
    to: "/rankings",
    label: "Bảng xếp hạng",
    icon: Trophy,
    // minLevel: ROLE_LEVELS.DEVELOPER,
  },
  {
    id: "utilities",
    to: "/utilities",
    label: "Tiện ích",
    icon: LayoutDashboard,
    display: false
  }
];

export const STUDENT_TABS = ({
  studentCode,
}: {
  studentCode: string;
}): NavigationItem[] => [
  {
    id: "profile",
    label: "Hồ sơ cá nhân",
    icon: Info,
    to: `/${studentCode}`,
  },
  {
    id: "classes",
    label: "Lớp học & Lịch sử",
    icon: BookOpen,
    to: `/${studentCode}/classes`,
  },
  {
    id: "progress",
    label: "Tiến trình & Điểm danh",
    icon: Activity,
    to: `/${studentCode}/progress`,
  },
  {
    id: "score",
    label: "Điểm rèn luyện",
    icon: Trophy,
    to: `/${studentCode}/score`,
  },
  {
    id: "tuition",
    label: "Học phí",
    icon: CreditCard,
    to: `/${studentCode}/tuition`,
  },
];

export const COACH_TABS = ({
  coachCode,
}: {
  coachCode: string;
}): NavigationItem[] => [
  {
    id: "profile",
    label: "Hồ sơ cá nhân",
    icon: Info,
    to: `/${coachCode}`,
  },
  {
    id: "classes",
    label: "Lớp phụ trách",
    icon: Users,
    to: `/${coachCode}/classes`,
  },
  {
    id: "timesheet",
    label: "Bảng chấm công",
    icon: CalendarRange,
    to: `/${coachCode}/timesheet`,
  },
];

export const BOTTOM_NAV_ITEMS = ({
  userId,
}: {
  userId: string;
}): NavigationItem[] => [
  {
    id: "overview",
    label: "Tổng quan",
    icon: House,
    minLevel: ROLE_LEVELS.MANAGER_SENIOR,
    to: "/",
  },
  {
    id: "utilities",
    label: "Tiện ích",
    icon: LayoutDashboard,
    to: "/utilities",
  },
  {
    id: "check-in",
    label: "Điểm danh",
    icon: ScanFace,
    to: "/check-in",
  },
  {
    id: "notifications",
    label: "Thông báo",
    icon: Bell,
    to: "/notifications",
  },
  {
    id: "profile",
    label: "Hồ sơ cá nhân",
    icon: Info,
    to: `/${userId}`,
  },
];
