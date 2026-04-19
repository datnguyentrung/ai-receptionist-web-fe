import type { Belt, ScheduleLevel } from "@/config/constants/CoreEnums";
import type {
  AttendanceStatus,
  EvaluationStatus,
} from "@/config/constants/OperationEnums";
import { useFilterAttendance } from "@/features/studentAttendance";
import { AttendanceFilters } from "@/pages/AttendanceReports/components/AttendanceFilters";
import { AttendancePageHeader } from "@/pages/AttendanceReports/components/AttendancePageHeader";
import { AttendanceSummarySection } from "@/pages/AttendanceReports/components/AttendanceSummarySection";
import { AttendanceTable } from "@/pages/AttendanceReports/components/AttendanceTable";
import { useAuthStore } from "@/store/authStore";
import type { AttendanceStats } from "@/types";
import { useState } from "react";
import styles from "./AttendanceReports.module.scss";

const PAGE_SIZE = parseInt(import.meta.env.VITE_PAGE_SIZE) || 30;

const EMPTY_ATTENDANCE_STATS: AttendanceStats = {
  totalRecords: 0,
  attendanceRate: 0,
  presentCount: 0,
  absentCount: 0,
  excusedCount: 0,
  makeupCount: 0,
  lateCount: 0,
  evalGoodCount: 0,
  evalAverageCount: 0,
  evalWeakCount: 0,
  evalPendingCount: 0,
};

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
  const [currentPage, setCurrentPage] = useState(1);
  const user = useAuthStore((state) => state.user);
  const scheduleIds =
    user?.userInfo.assignedClasses.map((c) => c.classSchedule.scheduleId) ?? [];

  const setAttendanceDrillDown = (nextStatuses: AttendanceStatus[] | null) => {
    setAttendanceStatuses(nextStatuses ?? []);
    setCurrentPage(1);
  };

  const setEvaluationDrillDown = (nextStatuses: EvaluationStatus[] | null) => {
    setEvaluationStatuses(nextStatuses ?? []);
    setCurrentPage(1);
  };

  const { data } = useFilterAttendance(
    search,
    dateFilter,
    attendanceStatuses,
    evaluationStatuses,
    belts,
    branches,
    scheduleLevels,
    scheduleIds,
    currentPage - 1, // Spring Boot dùng 0-based page
    PAGE_SIZE,
  );

  const handleClearAll = () => {
    setSearch("");
    setDateFilter("");
    setAttendanceStatuses([]);
    setEvaluationStatuses([]);
    setBelts([]);
    setBranches([]);
    setScheduleLevels([]);
    setCurrentPage(1);
  };

  return (
    <div className={styles.page}>
      <AttendancePageHeader
        totalRecords={data?.attendances.totalElements || 0}
      />
      <AttendanceSummarySection
        stats={data?.stats ?? EMPTY_ATTENDANCE_STATS}
        activeAttendanceStatuses={attendanceStatuses}
        activeEvaluationStatuses={evaluationStatuses}
        onAttendanceFilterChange={setAttendanceDrillDown}
        onEvaluationFilterChange={setEvaluationDrillDown}
      />
      <AttendanceFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setCurrentPage(1);
        }}
        dateFilter={dateFilter}
        onDateChange={(v) => {
          setDateFilter(v);
          setCurrentPage(1);
        }}
        attendanceStatuses={attendanceStatuses}
        onAttendanceStatusesChange={(v) => {
          setAttendanceStatuses(v);
          setCurrentPage(1);
        }}
        evaluationStatuses={evaluationStatuses}
        onEvaluationStatusesChange={(v) => {
          setEvaluationStatuses(v);
          setCurrentPage(1);
        }}
        belts={belts}
        onBeltsChange={(v) => {
          setBelts(v);
          setCurrentPage(1);
        }}
        branches={branches}
        onBranchesChange={(v) => {
          setBranches(v);
          setCurrentPage(1);
        }}
        scheduleLevels={scheduleLevels}
        onScheduleLevelsChange={(v) => {
          setScheduleLevels(v);
          setCurrentPage(1);
        }}
        resultCount={data?.attendances.totalElements || 0}
        onClearAll={handleClearAll}
      />
      <AttendanceTable
        data={data}
        currentPage={currentPage}
        pageSize={data?.attendances.size || PAGE_SIZE}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}
