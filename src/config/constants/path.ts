import { ROLE_LEVELS } from "@/config/constants/roleLevels";
import {
  Activity,
  BookOpen,
  CalendarRange,
  ClipboardCheck,
  CreditCard,
  History,
  Info,
  LayoutDashboard,
  ScanFace,
  Trophy,
  UserRoundCheck,
  Users,
} from "lucide-react";

export const NAV_ITEMS = ({ studentCode }: { studentCode?: string } = {}) => [
  // Ví dụ thêm menu Trang cá nhân dùng đến studentCode
  {
    path: `/${studentCode}/tuition`,
    label: "Học phí",
    icon: CreditCard,
  },
  {
    path: `/${studentCode}/progress`,
    label: "Tiến trình",
    icon: Activity,
  },
  {
    path: `/${studentCode}/classes`,
    label: "Lớp học",
    icon: BookOpen,
  },
  {
    path: studentCode ? `/${studentCode}` : "/welcome",
    label: "Trang cá nhân",
    icon: UserRoundCheck, // Thay icon tùy ý bạn
    minLevel: ROLE_LEVELS.STUDENT, // Sửa lại level phù hợp
  },
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
    minLevel: ROLE_LEVELS.DEVELOPER,
  },
  {
    path: "/public/exam",
    label: "Quản lý Khảo thí",
    icon: ClipboardCheck,
    minLevel: ROLE_LEVELS.DEVELOPER,
  },
  {
    path: "/rankings",
    label: "Bảng xếp hạng",
    icon: Trophy,
    minLevel: ROLE_LEVELS.DEVELOPER,
  },
];

export const STUDENT_TABS = ({ studentCode }: { studentCode: string }) => [
  {
    id: "profile",
    label: "Hồ sơ cá nhân",
    icon: Info,
    linkTo: `/${studentCode}`,
  },
  {
    id: "classes",
    label: "Lớp học & Lịch sử",
    icon: BookOpen,
    linkTo: `/${studentCode}/classes`,
  },
  {
    id: "progress",
    label: "Tiến trình & Điểm danh",
    icon: Activity,
    linkTo: `/${studentCode}/progress`,
  },
  {
    id: "tuition",
    label: "Học phí",
    icon: CreditCard,
    linkTo: `/${studentCode}/tuition`,
  },
];

export const COACH_TABS = ({ coachCode }: { coachCode: string }) => [
  {
    id: "profile",
    label: "Hồ sơ cá nhân",
    icon: Info,
    linkTo: `/${coachCode}`,
  },
  {
    id: "classes",
    label: "Lớp phụ trách",
    icon: Users,
    linkTo: `/${coachCode}/classes`,
  },
  {
    id: "timesheet",
    label: "Bảng chấm công",
    icon: CalendarRange,
    linkTo: `/${coachCode}/timesheet`,
  },
];
