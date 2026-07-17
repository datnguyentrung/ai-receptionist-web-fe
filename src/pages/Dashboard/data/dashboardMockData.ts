export interface ClassScheduleDTO {
  classId: string;
  className: string;
  classCode: string;
  coach: string;
  coachAvatar: string;
  room: string;
  dayOfWeek: string[];
  time: string;
  duration: number;
  capacity: number;
  enrolled: number;
  level: "beginner" | "intermediate" | "advanced" | "all";
  status: "ongoing" | "upcoming" | "completed";
}

export const CLASSES: ClassScheduleDTO[] = [
  {
    classId: "CLS-001",
    className: "Taekwondo Cơ Bản A",
    classCode: "TKD-CB-A",
    coach: "Trần Minh Khoa",
    coachAvatar: "TMK",
    room: "Phòng 1",
    dayOfWeek: ["Thứ 2", "Thứ 4", "Thứ 6"],
    time: "17:30 - 19:00",
    duration: 90,
    capacity: 20,
    enrolled: 16,
    level: "beginner",
    status: "ongoing",
  },
  {
    classId: "CLS-002",
    className: "Taekwondo Cơ Bản B",
    classCode: "TKD-CB-B",
    coach: "Trần Minh Khoa",
    coachAvatar: "TMK",
    room: "Phòng 1",
    dayOfWeek: ["Thứ 3", "Thứ 5", "Thứ 7"],
    time: "08:00 - 09:30",
    duration: 90,
    capacity: 20,
    enrolled: 14,
    level: "beginner",
    status: "ongoing",
  },
  {
    classId: "CLS-003",
    className: "Taekwondo Nâng Cao A",
    classCode: "TKD-NC-A",
    coach: "Lê Thanh Tùng",
    coachAvatar: "LTT",
    room: "Phòng 2",
    dayOfWeek: ["Thứ 2", "Thứ 4", "Thứ 6"],
    time: "19:00 - 20:30",
    duration: 90,
    capacity: 15,
    enrolled: 12,
    level: "intermediate",
    status: "ongoing",
  },
  {
    classId: "CLS-004",
    className: "Taekwondo Nâng Cao B",
    classCode: "TKD-NC-B",
    coach: "Lê Thanh Tùng",
    coachAvatar: "LTT",
    room: "Phòng 2",
    dayOfWeek: ["Thứ 3", "Thứ 5"],
    time: "19:00 - 20:30",
    duration: 90,
    capacity: 15,
    enrolled: 10,
    level: "intermediate",
    status: "ongoing",
  },
  {
    classId: "CLS-005",
    className: "Taekwondo Thiếu Nhi",
    classCode: "TKD-TN",
    coach: "Phạm Thu Hà",
    coachAvatar: "PTH",
    room: "Phòng 3",
    dayOfWeek: ["Thứ 3", "Thứ 5", "Thứ 7"],
    time: "15:00 - 16:00",
    duration: 60,
    capacity: 25,
    enrolled: 22,
    level: "beginner",
    status: "ongoing",
  },
  {
    classId: "CLS-006",
    className: "Taekwondo Cao Cấp",
    classCode: "TKD-CC",
    coach: "Nguyễn Đình Sơn",
    coachAvatar: "NDS",
    room: "Phòng 1",
    dayOfWeek: ["Thứ 2", "Thứ 4", "Thứ 6"],
    time: "06:00 - 07:30",
    duration: 90,
    capacity: 10,
    enrolled: 8,
    level: "advanced",
    status: "ongoing",
  },
  {
    classId: "CLS-007",
    className: "Taekwondo Khai Giảng Mới",
    classCode: "TKD-KG-01",
    coach: "Phạm Thu Hà",
    coachAvatar: "PTH",
    room: "Phòng 3",
    dayOfWeek: ["Thứ 2", "Thứ 4", "Thứ 6"],
    time: "17:00 - 18:00",
    duration: 60,
    capacity: 25,
    enrolled: 5,
    level: "all",
    status: "upcoming",
  },
];

export const STATS = {
  totalActiveStudents: 86,
  totalStudentsTrend: +12,
  activeCoaches: 4,
  coachesTrend: 0,
  classesToday: 5,
  classesTrend: +1,
  monthlyRevenue: 128500000,
  revenueTrend: +8.5,
};

export const MONTHLY_ENROLLMENT = [
  { month: "T9/25", students: 62 },
  { month: "T10/25", students: 68 },
  { month: "T11/25", students: 71 },
  { month: "T12/25", students: 75 },
  { month: "T1/26", students: 79 },
  { month: "T2/26", students: 83 },
  { month: "T3/26", students: 86 },
];

export const ATTENDANCE_RATE = [
  { day: "T2", rate: 92 },
  { day: "T3", rate: 88 },
  { day: "T4", rate: 95 },
  { day: "T5", rate: 90 },
  { day: "T6", rate: 85 },
  { day: "T7", rate: 78 },
  { day: "CN", rate: 0 },
];
