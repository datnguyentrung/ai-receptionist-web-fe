import ConfirmModal from "@/components/ConfirmModal";
import type { Belt, ScheduleLevel } from "@/config/constants/CoreEnums";
import type {
  AttendanceStatus,
  EvaluationStatus,
} from "@/config/constants/OperationEnums";
import {
  useFilterAttendance,
  useUpdateAttendanceBatch,
} from "@/features/studentAttendance";
import { AttendanceFilters } from "@/pages/AttendanceReports/components/AttendanceFilters";
import { AttendancePageHeader } from "@/pages/AttendanceReports/components/AttendancePageHeader";
import { AttendanceSummarySection } from "@/pages/AttendanceReports/components/AttendanceSummarySection";
import { AttendanceTable } from "@/pages/AttendanceReports/components/AttendanceTable";
import { SaveAttendanceConfirmContent } from "@/pages/AttendanceReports/components/SaveAttendanceConfirmContent/SaveAttendanceConfirmContent";
import { useAuthStore } from "@/store/authStore";
import type {
  AttendanceStats,
  StudentAttendanceResponse,
  StudentAttendanceSimpleResponse,
} from "@/types";
import { useMemo, useState } from "react";
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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editedRows, setEditedRows] = useState<
    Record<string, StudentAttendanceSimpleResponse>
  >({});

  const { mutateAsync: updateAttendanceBatch, isPending: isSaving } =
    useUpdateAttendanceBatch();
  const user = useAuthStore((state) => state.user);
  const scheduleIds =
    user?.userInfo.assignedClasses?.map((c) => c.classSchedule.scheduleId) ??
    [];

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

  const toCheckInString = (value: Date | string | null): string | null => {
    if (!value) return null;
    if (typeof value === "string") return value;
    return value.toISOString();
  };

  const toSimpleResponse = (
    row: StudentAttendanceResponse,
  ): StudentAttendanceSimpleResponse | null => {
    if (!row.attendanceId) return null;

    return {
      attendanceId: row.attendanceId,
      enrollmentId: row.enrollmentId,
      studentId: row.studentId,
      attendanceStatus: row.attendanceStatus ?? "ABSENT",
      checkInTime: toCheckInString(row.checkInTime),
      recordedByCoachName: row.recordedByCoachName,
      evaluationStatus: row.evaluationStatus,
      evaluatedByCoachName: row.evaluatedByCoachName,
      note: row.note,
    };
  };

  const isSamePayload = (
    a: StudentAttendanceSimpleResponse,
    b: StudentAttendanceSimpleResponse,
  ) => {
    return (
      a.attendanceStatus === b.attendanceStatus &&
      a.checkInTime === b.checkInTime &&
      a.evaluationStatus === b.evaluationStatus &&
      a.note === b.note &&
      a.recordedByCoachName === b.recordedByCoachName &&
      a.evaluatedByCoachName === b.evaluatedByCoachName
    );
  };

  const setRowDraft = (
    row: StudentAttendanceResponse,
    patch: Partial<StudentAttendanceSimpleResponse>,
  ) => {
    const base = toSimpleResponse(row);
    if (!base) return;

    setEditedRows((prev) => {
      const current = prev[base.attendanceId] ?? base;
      const next: StudentAttendanceSimpleResponse = {
        ...current,
        ...patch,
      };

      if (isSamePayload(next, base)) {
        const nextEditedRows = { ...prev };
        delete nextEditedRows[base.attendanceId];
        return nextEditedRows;
      }
      return {
        ...prev,
        [base.attendanceId]: next,
      };
    });
  };

  const handleAttendanceChange = (
    row: StudentAttendanceResponse,
    status: AttendanceStatus,
  ) => {
    const nextEvaluation: EvaluationStatus | null =
      status === "ABSENT" || status === "EXCUSED" ? null : "PENDING";

    setRowDraft(row, {
      attendanceStatus: status,
      evaluationStatus: nextEvaluation,
      checkInTime:
        status === "ABSENT" || status === "EXCUSED"
          ? null
          : toCheckInString(row.checkInTime),
    });
  };

  const handleEvaluationChange = (
    row: StudentAttendanceResponse,
    status: EvaluationStatus | null,
  ) => {
    setRowDraft(row, {
      evaluationStatus: status,
    });
  };

  const handleNoteChange = (
    row: StudentAttendanceResponse,
    note: string | null,
  ) => {
    setRowDraft(row, {
      note,
    });
  };

  const changedRows = useMemo(() => Object.values(editedRows), [editedRows]);

  const saveSummary = useMemo(() => {
    const attendanceSummary: Record<AttendanceStatus, number> = {
      PRESENT: 0,
      MAKEUP: 0,
      LATE: 0,
      EXCUSED: 0,
      ABSENT: 0,
    };

    const evaluationSummary: {
      pending: number;
      cleared: number;
      byStatus: Record<EvaluationStatus, number>;
    } = {
      pending: 0,
      cleared: 0,
      byStatus: {
        PENDING: 0,
        GOOD: 0,
        AVERAGE: 0,
        WEAK: 0,
      },
    };

    changedRows.forEach((row) => {
      attendanceSummary[row.attendanceStatus] += 1;

      if (row.evaluationStatus === null) {
        evaluationSummary.cleared += 1;
      } else {
        evaluationSummary.byStatus[row.evaluationStatus] += 1;
        if (row.evaluationStatus === "PENDING") {
          evaluationSummary.pending += 1;
        }
      }
    });

    return {
      attendanceSummary,
      evaluationSummary,
    };
  }, [changedRows]);

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

  const handleSave = async () => {
    if (changedRows.length === 0) {
      setIsConfirmOpen(false);
      return;
    }

    await updateAttendanceBatch(changedRows);
    setEditedRows({});
    setIsConfirmOpen(false);
  };

  const handleUndoRow = (attendanceId: string) => {
    setEditedRows((prev) => {
      const nextEditedRows = { ...prev };
      delete nextEditedRows[attendanceId];
      return nextEditedRows;
    });
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
        showSaveButton={changedRows.length > 0}
        saveButtonLabel={`Lưu (${changedRows.length})`}
        isSaving={isSaving}
        onSaveClick={() => setIsConfirmOpen(true)}
      />
      <AttendanceTable
        data={data}
        currentPage={currentPage}
        pageSize={data?.attendances.size || PAGE_SIZE}
        setCurrentPage={setCurrentPage}
        editedRows={editedRows}
        onAttendanceChange={handleAttendanceChange}
        onEvaluationChange={handleEvaluationChange}
        onNoteChange={handleNoteChange}
        onUndoRow={handleUndoRow}
      />

      <ConfirmModal
        open={isConfirmOpen}
        title="Lưu thay đổi điểm danh"
        description="Bạn sắp cập nhật trạng thái điểm danh và đánh giá cho các học viên đã chỉnh sửa."
        confirmText="Lưu"
        loadingText="Đang lưu..."
        isLoading={isSaving}
        successToastMessage="Lưu điểm danh thành công"
        errorToastMessage="Lưu điểm danh thất bại"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleSave}
      >
        <SaveAttendanceConfirmContent
          changedCount={changedRows.length}
          attendanceSummary={saveSummary.attendanceSummary}
          evaluationSummary={saveSummary.evaluationSummary}
        />
      </ConfirmModal>
    </div>
  );
}
