import { useFilterAttendance } from "@/features/studentAttendance";
import type { StudentOverview } from "@/types";
import { useState } from "react";
import { AttendanceTable } from "../../../AttendanceReports/components/AttendanceTable";
import "./AttendanceTableModal.scss";

const PAGE_SIZE = parseInt(import.meta.env.VITE_PAGE_SIZE) || 30;

type Props = {
  student: StudentOverview;
};

const STATUS_LABEL: Record<StudentOverview["studentStatus"], string> = {
  ACTIVE: "Đang học",
  RESERVED: "Tạm nghỉ",
  DROPPED: "Nghỉ học",
};

export function AttendanceTableModal({ student }: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  const birthDateLabel = new Date(student.birthDate).toLocaleDateString(
    "vi-VN",
  );
  const scheduleList = student.classSchedules.map(
    (schedule) => schedule.scheduleId,
  );

  const { data } = useFilterAttendance(
    student.studentCode,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    currentPage - 1, // Spring Boot dùng 0-based page
    PAGE_SIZE,
  );

  return (
    <div className="attendance-table-modal">
      <div className="modal-header">
        <h2>Lịch sử điểm danh</h2>
        <p>
          Học viên <strong>{student.fullName}</strong> · Mã{" "}
          {student.studentCode}
        </p>
      </div>

      <div className="student-overview-grid">
        <div className="overview-item">
          <span className="overview-label">SĐT</span>
          <span className="overview-value">{student.phoneNumber}</span>
        </div>
        <div className="overview-item">
          <span className="overview-label">Ngày sinh</span>
          <span className="overview-value">{birthDateLabel}</span>
        </div>
        <div className="overview-item">
          <span className="overview-label">Đai</span>
          <span className="overview-value">{student.belt}</span>
        </div>
        <div className="overview-item">
          <span className="overview-label">Trạng thái</span>
          <span className="overview-value">
            {STATUS_LABEL[student.studentStatus]}
          </span>
        </div>
        <div className="overview-item">
          <span className="overview-label">Cơ sở</span>
          <span className="overview-value">{student.branchName}</span>
        </div>
        <div className="overview-item">
          <span className="overview-label">Số lớp đang học</span>
          <span className="overview-value">
            {student.classSchedules.length}
          </span>
        </div>
      </div>

      <div className="schedule-chips">
        {scheduleList.length > 0 ? (
          scheduleList.map((scheduleId) => (
            <span key={scheduleId} className="schedule-chip">
              {scheduleId}
            </span>
          ))
        ) : (
          <span className="schedule-chip is-empty">Chưa có lớp phân công</span>
        )}
      </div>

      <div className="modal-content">
        <div className="attendance-table-shell">
          <AttendanceTable
            data={data}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
