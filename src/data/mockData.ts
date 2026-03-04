export interface StudentEnrollmentResDTO {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  phone: string;
  email: string;
  className: string;
  classCode: string;
  coachName: string;
  enrollmentDate: string;
  startDate: string;
  status: "active" | "pending" | "completed" | "cancelled";
  fee: number;
  paymentStatus: "paid" | "unpaid" | "partial";
}

export interface CoachDTO {
  coachId: string;
  name: string;
  avatar: string;
  specialty: string;
  email: string;
  phone: string;
  activeStudents: number;
  activeClasses: number;
  experience: number;
  rating: number;
  status: "active" | "inactive" | "on-leave";
  joinDate: string;
}

export interface StudentDTO {
  studentId: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  dob: string;
  gender: "male" | "female";
  enrolledClass: string;
  coach: string;
  enrollDate: string;
  belt: string;
  status: "active" | "inactive" | "graduated";
}

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

export interface AttendanceDTO {
  attendanceId: string;
  studentName: string;
  studentAvatar: string;
  className: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "present" | "absent" | "late" | "excused";
  coachName: string;
}

// ──────────────────────────────────────────────────────────────
// MOCK DATA
// ──────────────────────────────────────────────────────────────

export const ENROLLMENTS: StudentEnrollmentResDTO[] = [
  {
    enrollmentId: "ENR-001",
    studentId: "STU-001",
    studentName: "Nguyễn Văn An",
    studentAvatar: "NVA",
    phone: "0901234567",
    email: "an.nguyen@email.com",
    className: "Taekwondo Cơ Bản A",
    classCode: "TKD-CB-A",
    coachName: "HLV Trần Minh Khoa",
    enrollmentDate: "2026-02-28",
    startDate: "2026-03-01",
    status: "active",
    fee: 1500000,
    paymentStatus: "paid",
  },
  {
    enrollmentId: "ENR-002",
    studentId: "STU-002",
    studentName: "Trần Thị Bích",
    studentAvatar: "TTB",
    phone: "0912345678",
    email: "bich.tran@email.com",
    className: "Taekwondo Nâng Cao B",
    classCode: "TKD-NC-B",
    coachName: "HLV Lê Thanh Tùng",
    enrollmentDate: "2026-02-27",
    startDate: "2026-03-01",
    status: "active",
    fee: 2000000,
    paymentStatus: "partial",
  },
  {
    enrollmentId: "ENR-003",
    studentId: "STU-003",
    studentName: "Lê Hoàng Nam",
    studentAvatar: "LHN",
    phone: "0923456789",
    email: "nam.le@email.com",
    className: "Taekwondo Thiếu Nhi",
    classCode: "TKD-TN",
    coachName: "HLV Phạm Thu Hà",
    enrollmentDate: "2026-02-26",
    startDate: "2026-03-03",
    status: "pending",
    fee: 1200000,
    paymentStatus: "unpaid",
  },
  {
    enrollmentId: "ENR-004",
    studentId: "STU-004",
    studentName: "Phạm Ngọc Linh",
    studentAvatar: "PNL",
    phone: "0934567890",
    email: "linh.pham@email.com",
    className: "Taekwondo Cơ Bản B",
    classCode: "TKD-CB-B",
    coachName: "HLV Trần Minh Khoa",
    enrollmentDate: "2026-02-25",
    startDate: "2026-03-02",
    status: "active",
    fee: 1500000,
    paymentStatus: "paid",
  },
  {
    enrollmentId: "ENR-005",
    studentId: "STU-005",
    studentName: "Võ Đức Huy",
    studentAvatar: "VDH",
    phone: "0945678901",
    email: "huy.vo@email.com",
    className: "Taekwondo Cao Cấp",
    classCode: "TKD-CC",
    coachName: "HLV Nguyễn Đình Sơn",
    enrollmentDate: "2026-02-24",
    startDate: "2026-03-01",
    status: "active",
    fee: 2500000,
    paymentStatus: "paid",
  },
  {
    enrollmentId: "ENR-006",
    studentId: "STU-006",
    studentName: "Đặng Thùy Dương",
    studentAvatar: "DTD",
    phone: "0956789012",
    email: "duong.dang@email.com",
    className: "Taekwondo Nâng Cao A",
    classCode: "TKD-NC-A",
    coachName: "HLV Lê Thanh Tùng",
    enrollmentDate: "2026-02-23",
    startDate: "2026-02-24",
    status: "active",
    fee: 2000000,
    paymentStatus: "paid",
  },
  {
    enrollmentId: "ENR-007",
    studentId: "STU-007",
    studentName: "Bùi Minh Quân",
    studentAvatar: "BMQ",
    phone: "0967890123",
    email: "quan.bui@email.com",
    className: "Taekwondo Thiếu Nhi",
    classCode: "TKD-TN",
    coachName: "HLV Phạm Thu Hà",
    enrollmentDate: "2026-02-22",
    startDate: "2026-02-23",
    status: "cancelled",
    fee: 1200000,
    paymentStatus: "unpaid",
  },
  {
    enrollmentId: "ENR-008",
    studentId: "STU-008",
    studentName: "Hoàng Khánh Vy",
    studentAvatar: "HKV",
    phone: "0978901234",
    email: "vy.hoang@email.com",
    className: "Taekwondo Cơ Bản A",
    classCode: "TKD-CB-A",
    coachName: "HLV Trần Minh Khoa",
    enrollmentDate: "2026-02-21",
    startDate: "2026-02-22",
    status: "active",
    fee: 1500000,
    paymentStatus: "paid",
  },
];

export const COACHES: CoachDTO[] = [
  {
    coachId: "COACH-001",
    name: "Trần Minh Khoa",
    avatar: "TMK",
    specialty: "Taekwondo Cơ Bản",
    email: "khoa.tran@tkdvq.com",
    phone: "0901111222",
    activeStudents: 24,
    activeClasses: 3,
    experience: 8,
    rating: 4.9,
    status: "active",
    joinDate: "2018-06-01",
  },
  {
    coachId: "COACH-002",
    name: "Lê Thanh Tùng",
    avatar: "LTT",
    specialty: "Taekwondo Nâng Cao",
    email: "tung.le@tkdvq.com",
    phone: "0902222333",
    activeStudents: 18,
    activeClasses: 2,
    experience: 6,
    rating: 4.7,
    status: "active",
    joinDate: "2020-01-15",
  },
  {
    coachId: "COACH-003",
    name: "Phạm Thu Hà",
    avatar: "PTH",
    specialty: "Taekwondo Thiếu Nhi",
    email: "ha.pham@tkdvq.com",
    phone: "0903333444",
    activeStudents: 32,
    activeClasses: 4,
    experience: 10,
    rating: 5.0,
    status: "active",
    joinDate: "2015-09-01",
  },
  {
    coachId: "COACH-004",
    name: "Nguyễn Đình Sơn",
    avatar: "NDS",
    specialty: "Taekwondo Cao Cấp",
    email: "son.nguyen@tkdvq.com",
    phone: "0904444555",
    activeStudents: 12,
    activeClasses: 2,
    experience: 15,
    rating: 4.8,
    status: "active",
    joinDate: "2010-03-20",
  },
  {
    coachId: "COACH-005",
    name: "Vũ Quốc Bảo",
    avatar: "VQB",
    specialty: "Taekwondo Thiếu Nhi",
    email: "bao.vu@tkdvq.com",
    phone: "0905555666",
    activeStudents: 0,
    activeClasses: 0,
    experience: 4,
    rating: 4.5,
    status: "on-leave",
    joinDate: "2022-07-10",
  },
];

export const STUDENTS: StudentDTO[] = [
  { studentId: "STU-001", name: "Nguyễn Văn An", avatar: "NVA", email: "an.nguyen@email.com", phone: "0901234567", dob: "2010-05-14", gender: "male", enrolledClass: "Taekwondo Cơ Bản A", coach: "Trần Minh Khoa", enrollDate: "2026-03-01", belt: "Đai Vàng", status: "active" },
  { studentId: "STU-002", name: "Trần Thị Bích", avatar: "TTB", email: "bich.tran@email.com", phone: "0912345678", dob: "2008-11-22", gender: "female", enrolledClass: "Taekwondo Nâng Cao B", coach: "Lê Thanh Tùng", enrollDate: "2026-03-01", belt: "Đai Xanh Lam", status: "active" },
  { studentId: "STU-003", name: "Lê Hoàng Nam", avatar: "LHN", email: "nam.le@email.com", phone: "0923456789", dob: "2015-03-08", gender: "male", enrolledClass: "Taekwondo Thiếu Nhi", coach: "Phạm Thu Hà", enrollDate: "2026-03-03", belt: "Đai Trắng", status: "inactive" },
  { studentId: "STU-004", name: "Phạm Ngọc Linh", avatar: "PNL", email: "linh.pham@email.com", phone: "0934567890", dob: "2012-07-19", gender: "female", enrolledClass: "Taekwondo Cơ Bản B", coach: "Trần Minh Khoa", enrollDate: "2026-03-02", belt: "Đai Trắng", status: "active" },
  { studentId: "STU-005", name: "Võ Đức Huy", avatar: "VDH", email: "huy.vo@email.com", phone: "0945678901", dob: "2005-01-30", gender: "male", enrolledClass: "Taekwondo Cao Cấp", coach: "Nguyễn Đình Sơn", enrollDate: "2026-03-01", belt: "Đai Đen 1 Đẳng", status: "active" },
  { studentId: "STU-006", name: "Đặng Thùy Dương", avatar: "DTD", email: "duong.dang@email.com", phone: "0956789012", dob: "2009-09-05", gender: "female", enrolledClass: "Taekwondo Nâng Cao A", coach: "Lê Thanh Tùng", enrollDate: "2026-02-24", belt: "Đai Xanh Lá", status: "active" },
  { studentId: "STU-007", name: "Bùi Minh Quân", avatar: "BMQ", email: "quan.bui@email.com", phone: "0967890123", dob: "2016-06-12", gender: "male", enrolledClass: "Taekwondo Thiếu Nhi", coach: "Phạm Thu Hà", enrollDate: "2026-02-23", belt: "Đai Trắng", status: "inactive" },
  { studentId: "STU-008", name: "Hoàng Khánh Vy", avatar: "HKV", email: "vy.hoang@email.com", phone: "0978901234", dob: "2011-12-25", gender: "female", enrolledClass: "Taekwondo Cơ Bản A", coach: "Trần Minh Khoa", enrollDate: "2026-02-22", belt: "Đai Vàng", status: "active" },
  { studentId: "STU-009", name: "Ngô Thanh Phong", avatar: "NTP", email: "phong.ngo@email.com", phone: "0989012345", dob: "2007-04-17", gender: "male", enrolledClass: "Taekwondo Nâng Cao A", coach: "Lê Thanh Tùng", enrollDate: "2026-02-20", belt: "Đai Đỏ", status: "active" },
  { studentId: "STU-010", name: "Lý Thị Lan", avatar: "LTL", email: "lan.ly@email.com", phone: "0990123456", dob: "2013-08-03", gender: "female", enrolledClass: "Taekwondo Thiếu Nhi", coach: "Phạm Thu Hà", enrollDate: "2026-02-18", belt: "Đai Trắng", status: "active" },
];

export const CLASSES: ClassScheduleDTO[] = [
  { classId: "CLS-001", className: "Taekwondo Cơ Bản A", classCode: "TKD-CB-A", coach: "Trần Minh Khoa", coachAvatar: "TMK", room: "Phòng 1", dayOfWeek: ["Thứ 2", "Thứ 4", "Thứ 6"], time: "17:30 - 19:00", duration: 90, capacity: 20, enrolled: 16, level: "beginner", status: "ongoing" },
  { classId: "CLS-002", className: "Taekwondo Cơ Bản B", classCode: "TKD-CB-B", coach: "Trần Minh Khoa", coachAvatar: "TMK", room: "Phòng 1", dayOfWeek: ["Thứ 3", "Thứ 5", "Thứ 7"], time: "08:00 - 09:30", duration: 90, capacity: 20, enrolled: 14, level: "beginner", status: "ongoing" },
  { classId: "CLS-003", className: "Taekwondo Nâng Cao A", classCode: "TKD-NC-A", coach: "Lê Thanh Tùng", coachAvatar: "LTT", room: "Phòng 2", dayOfWeek: ["Thứ 2", "Thứ 4", "Thứ 6"], time: "19:00 - 20:30", duration: 90, capacity: 15, enrolled: 12, level: "intermediate", status: "ongoing" },
  { classId: "CLS-004", className: "Taekwondo Nâng Cao B", classCode: "TKD-NC-B", coach: "Lê Thanh Tùng", coachAvatar: "LTT", room: "Phòng 2", dayOfWeek: ["Thứ 3", "Thứ 5"], time: "19:00 - 20:30", duration: 90, capacity: 15, enrolled: 10, level: "intermediate", status: "ongoing" },
  { classId: "CLS-005", className: "Taekwondo Thiếu Nhi", classCode: "TKD-TN", coach: "Phạm Thu Hà", coachAvatar: "PTH", room: "Phòng 3", dayOfWeek: ["Thứ 3", "Thứ 5", "Thứ 7"], time: "15:00 - 16:00", duration: 60, capacity: 25, enrolled: 22, level: "beginner", status: "ongoing" },
  { classId: "CLS-006", className: "Taekwondo Cao Cấp", classCode: "TKD-CC", coach: "Nguyễn Đình Sơn", coachAvatar: "NDS", room: "Phòng 1", dayOfWeek: ["Thứ 2", "Thứ 4", "Thứ 6"], time: "06:00 - 07:30", duration: 90, capacity: 10, enrolled: 8, level: "advanced", status: "ongoing" },
  { classId: "CLS-007", className: "Taekwondo Khai Giảng Mới", classCode: "TKD-KG-01", coach: "Phạm Thu Hà", coachAvatar: "PTH", room: "Phòng 3", dayOfWeek: ["Thứ 2", "Thứ 4", "Thứ 6"], time: "17:00 - 18:00", duration: 60, capacity: 25, enrolled: 5, level: "all", status: "upcoming" },
];

export const ATTENDANCE: AttendanceDTO[] = [
  { attendanceId: "ATT-001", studentName: "Nguyễn Văn An", studentAvatar: "NVA", className: "Taekwondo Cơ Bản A", date: "2026-03-04", checkIn: "17:32", checkOut: "18:58", status: "present", coachName: "Trần Minh Khoa" },
  { attendanceId: "ATT-002", studentName: "Trần Thị Bích", studentAvatar: "TTB", className: "Taekwondo Nâng Cao B", date: "2026-03-04", checkIn: "19:05", checkOut: "20:28", status: "late", coachName: "Lê Thanh Tùng" },
  { attendanceId: "ATT-003", studentName: "Phạm Ngọc Linh", studentAvatar: "PNL", className: "Taekwondo Cơ Bản B", date: "2026-03-04", checkIn: "08:00", checkOut: "09:29", status: "present", coachName: "Trần Minh Khoa" },
  { attendanceId: "ATT-004", studentName: "Võ Đức Huy", studentAvatar: "VDH", className: "Taekwondo Cao Cấp", date: "2026-03-04", checkIn: "-", checkOut: "-", status: "absent", coachName: "Nguyễn Đình Sơn" },
  { attendanceId: "ATT-005", studentName: "Đặng Thùy Dương", studentAvatar: "DTD", className: "Taekwondo Nâng Cao A", date: "2026-03-03", checkIn: "17:30", checkOut: "19:00", status: "present", coachName: "Lê Thanh Tùng" },
  { attendanceId: "ATT-006", studentName: "Hoàng Khánh Vy", studentAvatar: "HKV", className: "Taekwondo Cơ Bản A", date: "2026-03-03", checkIn: "17:31", checkOut: "18:59", status: "present", coachName: "Trần Minh Khoa" },
  { attendanceId: "ATT-007", studentName: "Lý Thị Lan", studentAvatar: "LTL", className: "Taekwondo Thiếu Nhi", date: "2026-03-03", checkIn: "-", checkOut: "-", status: "excused", coachName: "Phạm Thu Hà" },
  { attendanceId: "ATT-008", studentName: "Ngô Thanh Phong", studentAvatar: "NTP", className: "Taekwondo Nâng Cao A", date: "2026-03-03", checkIn: "17:35", checkOut: "19:00", status: "late", coachName: "Lê Thanh Tùng" },
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
