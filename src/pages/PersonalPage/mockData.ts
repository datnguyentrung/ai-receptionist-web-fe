// --- Types ---
export type Role = "STUDENT" | "COACH" | "MANAGER";

export interface UserBase {
  id: string;
  avatar: string;
  fullName: string;
  belt: string;
  birthDate: string;
  gender: "Nam" | "Nữ";
  phoneNumber: string;
  email: string;
  status: "Active" | "Locked";
  role: Role;
}

export interface Student extends UserBase {
  role: "STUDENT";
  studentCode: string;
  startDate: string;
  branch: string;
  studentStatus: "Đang học" | "Bảo lưu" | "Nghỉ học";
  enrollments: {
    id: string;
    classSchedule: string;
    joinDate: string;
    status: "Active" | "Kết thúc";
    note?: string;
  }[];
  attendance: {
    id: string;
    sessionDate: string;
    attendanceStatus: "Có mặt" | "Vắng";
    checkInTime?: string;
    evaluationStatus: "Đạt" | "Không đạt" | "Tốt";
    note?: string;
  }[];
  tuition: {
    id: string;
    totalAmount: number;
    createdAt: string;
    forMonth: number;
    forYear: number;
    enrollment: string;
    amountAllocated: number;
  }[];
}

export interface Coach extends UserBase {
  role: "COACH" | "MANAGER";
  staffCode: string;
  coachStatus: "Active" | "Nghỉ phép" | "Nghỉ việc";
  assignments: {
    id: string;
    classSchedule: string;
    assignedDate: string;
    assignmentStatus: "Active" | "Inactive";
  }[];
  timesheets: {
    id: string;
    workingDate: string;
    checkInTime: string;
    classSchedule: string;
    status: "Chờ duyệt" | "Đã duyệt" | "Không hợp lệ";
  }[];
}

// --- Mock Data ---

export const mockStudent: Student = {
  id: "u1",
  avatar:
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
  fullName: "Nguyễn Văn Anh",
  belt: "Đai Vàng Cấp 2",
  birthDate: "2010-05-15",
  gender: "Nam",
  phoneNumber: "0901234567",
  email: "vananh.student@example.com",
  status: "Active",
  role: "STUDENT",
  studentCode: "HV-2024-0012",
  startDate: "2024-01-10",
  branch: "Cơ sở Cầu Giấy, HN",
  studentStatus: "Đang học",
  enrollments: [
    {
      id: "e1",
      classSchedule: "Lớp Cơ Bản (T2-T4-T6, 18h-19h30)",
      joinDate: "2024-01-12",
      status: "Active",
    },
    {
      id: "e2",
      classSchedule: "Lớp Tự Vệ (T7-CN, 16h-17h)",
      joinDate: "2023-09-01",
      status: "Kết thúc",
      note: "Đã hoàn thành khóa 3 tháng",
    },
  ],
  attendance: [
    {
      id: "a1",
      sessionDate: "2024-05-15",
      attendanceStatus: "Có mặt",
      checkInTime: "17:45",
      evaluationStatus: "Tốt",
      note: "Kỹ thuật đá tốt",
    },
    {
      id: "a2",
      sessionDate: "2024-05-13",
      attendanceStatus: "Vắng",
      evaluationStatus: "Không đạt",
      note: "Xin phép ốm",
    },
    {
      id: "a3",
      sessionDate: "2024-05-10",
      attendanceStatus: "Có mặt",
      checkInTime: "17:50",
      evaluationStatus: "Đạt",
    },
    {
      id: "a4",
      sessionDate: "2024-05-08",
      attendanceStatus: "Có mặt",
      checkInTime: "17:55",
      evaluationStatus: "Tốt",
    },
  ],
  tuition: [
    {
      id: "t1",
      totalAmount: 1500000,
      createdAt: "2024-05-01",
      forMonth: 5,
      forYear: 2024,
      enrollment: "Lớp Cơ Bản",
      amountAllocated: 1500000,
    },
    {
      id: "t2",
      totalAmount: 1500000,
      createdAt: "2024-04-02",
      forMonth: 4,
      forYear: 2024,
      enrollment: "Lớp Cơ Bản",
      amountAllocated: 1500000,
    },
    {
      id: "t3",
      totalAmount: 1500000,
      createdAt: "2024-03-05",
      forMonth: 3,
      forYear: 2024,
      enrollment: "Lớp Cơ Bản",
      amountAllocated: 1500000,
    },
  ],
};

export const mockCoach: Coach = {
  id: "u2",
  avatar:
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
  fullName: "Trần Thị Lan",
  belt: "Đai Đen 3 Đẳng",
  birthDate: "1992-11-20",
  gender: "Nữ",
  phoneNumber: "0987654321",
  email: "lan.coach@martialarts.vn",
  status: "Active",
  role: "COACH",
  staffCode: "HLV-045",
  coachStatus: "Active",
  assignments: [
    {
      id: "as1",
      classSchedule: "Lớp Cơ Bản (T2-T4-T6, 18h-19h30)",
      assignedDate: "2023-01-10",
      assignmentStatus: "Active",
    },
    {
      id: "as2",
      classSchedule: "Lớp Nâng Cao (T3-T5, 19h-21h)",
      assignedDate: "2023-06-15",
      assignmentStatus: "Active",
    },
    {
      id: "as3",
      classSchedule: "Lớp Thiếu Nhi (T7-CN, 8h-9h30)",
      assignedDate: "2022-03-01",
      assignmentStatus: "Inactive",
    },
  ],
  timesheets: [
    {
      id: "ts1",
      workingDate: "2024-05-15",
      checkInTime: "17:30",
      classSchedule: "Lớp Cơ Bản",
      status: "Chờ duyệt",
    },
    {
      id: "ts2",
      workingDate: "2024-05-14",
      checkInTime: "18:45",
      classSchedule: "Lớp Nâng Cao",
      status: "Đã duyệt",
    },
    {
      id: "ts3",
      workingDate: "2024-05-13",
      checkInTime: "17:35",
      classSchedule: "Lớp Cơ Bản",
      status: "Đã duyệt",
    },
    {
      id: "ts4",
      workingDate: "2024-05-11",
      checkInTime: "19:05",
      classSchedule: "Lớp Nâng Cao",
      status: "Không hợp lệ",
    },
  ],
};
