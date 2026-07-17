export interface ClassSessionDTO {
  sessionId: string;
  classId: string;
  className: string;
  classCode: string;
  branchName: string;
  timeStart: string;
  timeEnd: string;
  weekday: string;
  date: string;
  coachName: string;
  coachAvatar: string;
  room: string;
  totalStudents: number;
  status: "upcoming" | "in-progress" | "completed" | "ongoing";
}

export const CLASS_SESSION: ClassSessionDTO = {
  sessionId: "SES-20260304-001",
  classId: "CLS-001",
  className: "Taekwondo Cơ Bản A",
  classCode: "TKD-CB-A",
  branchName: "Chi nhánh Văn Quán",
  timeStart: "08:30",
  timeEnd: "10:00",
  weekday: "Thứ 4",
  date: "2026-03-04",
  coachName: "Trần Minh Khoa",
  coachAvatar: "TMK",
  room: "Phòng tập 1",
  totalStudents: 12,
  status: "in-progress",
};
