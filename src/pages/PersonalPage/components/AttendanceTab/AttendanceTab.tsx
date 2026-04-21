import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useFilterAttendance } from "../../../../features/studentAttendance";
import type { CoachDetail, StudentDetail } from "../../../../types";
import { AttendanceTable } from "../../../AttendanceReports/components/AttendanceTable";
import "./AttendanceTab.scss";
const PAGE_SIZE = parseInt(import.meta.env.VITE_PAGE_SIZE) || 30;

type OutletContextType = {
  data?: StudentDetail | CoachDetail;
};

export default function AttendanceTab() {
  const context = useOutletContext<OutletContextType>();
  const profile = context?.data;
  const isStudent = !!profile && "studentCode" in profile;
  const studentCode = isStudent ? profile.studentCode : undefined;
  const [currentPage, setCurrentPage] = useState(1);
  const { data } = useFilterAttendance(
    studentCode,
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

  if (!profile) {
    return (
      <Card>
        <CardContent>Không có dữ liệu hồ sơ để hiển thị điểm danh.</CardContent>
      </Card>
    );
  }

  if (!isStudent) {
    return (
      <Card>
        <CardContent>Tab điểm danh chỉ áp dụng cho hồ sơ học viên.</CardContent>
      </Card>
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
