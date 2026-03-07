import type { Belt, ScheduleLevel } from "@/config/constants/CoreEnums";
import type {
  AttendanceStatus,
  EvaluationStatus,
} from "@/config/constants/OperationEnums";
import { ATTENDANCE } from "@/data/mockData";
import { AttendanceFilters } from "@/pages/AttendanceReports/components/AttendanceFilters";
import { AttendancePageHeader } from "@/pages/AttendanceReports/components/AttendancePageHeader";
import { AttendanceSummarySection } from "@/pages/AttendanceReports/components/AttendanceSummarySection";
import { AttendanceTable } from "@/pages/AttendanceReports/components/AttendanceTable";
import { useState } from "react";
import styles from "./AttendanceReports.module.scss";

export function AttendanceReports() {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [attendanceStatuses, setAttendanceStatuses] = useState<
    AttendanceStatus[]
  >([]);
  const [evaluationStatuses, setEvaluationStatuses] = useState<
    EvaluationStatus[]
  >([]);
  const [belts, setBelts] = useState<Belt[]>([]);
  const [branches, setBranches] = useState<number[]>([]);
  const [scheduleLevels, setScheduleLevels] = useState<ScheduleLevel[]>([]);

  const filtered = ATTENDANCE.filter((a) => {
    const matchSearch =
      !search ||
      a.studentName.toLowerCase().includes(search.toLowerCase()) ||
      a.className.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || a.date === dateFilter;
    const matchStatus =
      attendanceStatuses.length === 0 ||
      attendanceStatuses.some((s) => s.toLowerCase() === a.status);
    return matchSearch && matchDate && matchStatus;
  });

  const handleClearAll = () => {
    setSearch("");
    setDateFilter("");
    setAttendanceStatuses([]);
    setEvaluationStatuses([]);
    setBelts([]);
    setBranches([]);
    setScheduleLevels([]);
  };

  return (
    <div className={styles.page}>
      <AttendancePageHeader totalRecords={ATTENDANCE.length} />
      <AttendanceSummarySection />
      <AttendanceFilters
        search={search}
        onSearchChange={setSearch}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        attendanceStatuses={attendanceStatuses}
        onAttendanceStatusesChange={setAttendanceStatuses}
        evaluationStatuses={evaluationStatuses}
        onEvaluationStatusesChange={setEvaluationStatuses}
        belts={belts}
        onBeltsChange={setBelts}
        branches={branches}
        onBranchesChange={setBranches}
        scheduleLevels={scheduleLevels}
        onScheduleLevelsChange={setScheduleLevels}
        resultCount={filtered.length}
        onClearAll={handleClearAll}
      />
      <AttendanceTable data={filtered} total={ATTENDANCE.length} />
    </div>
  );
}
