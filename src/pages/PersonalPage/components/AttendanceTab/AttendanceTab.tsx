import { Card, CardContent } from "@/components/ui/card";
import { studentAttendanceAPI } from "@/features/studentAttendance/api/studentAttendanceAPI";
import { useGetQuery } from "@/hooks/useCrud";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AttendanceTable } from "../../../AttendanceReports/components/AttendanceTable";
import type { OutletContextType } from "../TabViews/TabViews";
import "./AttendanceTab.scss";
const PAGE_SIZE = parseInt(import.meta.env.VITE_PAGE_SIZE) || 30;

export default function AttendanceTab() {
  const context = useOutletContext<OutletContextType>();
  const profile = context?.user;
  const isStudent = !!profile && "studentCode" in profile;
  const studentCode = isStudent ? profile.studentCode : undefined;
  const [currentPage, setCurrentPage] = useState(1);
  const { data } = useGetQuery(
    [
      "student-attendance",
      studentCode,
      { page: currentPage - 1, size: PAGE_SIZE },
    ],
    () =>
      studentAttendanceAPI.filter({
        search: studentCode,
        page: currentPage - 1,
        size: PAGE_SIZE,
      }),
    { enabled: !!studentCode, staleTime: 5 * 60 * 1000 },
  );

  console.log("Profile Data:", profile);
  console.log("studentCode Data:", studentCode);
  console.log("Attendance Data:", data);

  if (!profile) {
    return (
      <div className="attendance-tab">
        <Card className="attendance-tab__empty-card">
          <CardContent className="attendance-tab__empty-content">
            <p className="attendance-tab__empty-title">
              Không có dữ liệu lớp học.
            </p>
            <p className="attendance-tab__empty-text">
              Hồ sơ người dùng chưa sẵn sàng hoặc chưa được tải về từ hệ thống.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="attendance-tab">
        <Card className="attendance-tab__empty-card">
          <CardContent className="attendance-tab__empty-content">
            <p className="attendance-tab__empty-title">
              Tab điểm danh chỉ áp dụng cho hồ sơ học viên.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AttendanceTable
      data={data}
      currentPage={currentPage}
      pageSize={data?.attendances.size || PAGE_SIZE}
      setCurrentPage={setCurrentPage}
    />
  );
}
