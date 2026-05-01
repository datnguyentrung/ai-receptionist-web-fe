import ConfirmModal from "@/components/ConfirmModal";
import {
  AttendanceStatusLabel,
  EvaluationStatusLabel,
} from "@/config/constants";
import type { Belt, ScheduleLevel } from "@/config/constants/CoreEnums";
import type {
  AttendanceStatus,
  EvaluationStatus,
} from "@/config/constants/OperationEnums";
import { studentAttendanceAPI } from "@/features/studentAttendance/api/studentAttendanceAPI";
import { useGenericMutation, useGetQuery } from "@/hooks/useCrud";
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
import { formatDateDMY } from "@/utils/format";
import { Trash2 } from "lucide-react";
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
  const [selectedAttendanceIds, setSelectedAttendanceIds] = useState<string[]>(
    [],
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);

  const { mutateAsync: updateAttendanceBatch, isPending: isSaving } =
    useGenericMutation<
      StudentAttendanceResponse[],
      StudentAttendanceSimpleResponse[]
    >(
      (data) => studentAttendanceAPI.updateAttendance(data),
      [["student-attendance"]],
    );
  const { mutateAsync: deleteAttendanceBatch, isPending: isDeleting } =
    useGenericMutation<void, string[]>(
      (attendanceIds) => studentAttendanceAPI.deleteAttendance(attendanceIds),
      [["student-attendance"]],
    );
  const user = useAuthStore((state) => state.activeProfile);
  const scheduleIds =
    user?.userInfo?.assignedClasses
      ?.map((c) => c?.classSchedule?.scheduleId)
      ?.filter((id): id is string => Boolean(id)) ?? [];

  const setAttendanceDrillDown = (nextStatuses: AttendanceStatus[] | null) => {
    setAttendanceStatuses(nextStatuses ?? []);
    setCurrentPage(1);
  };

  const setEvaluationDrillDown = (nextStatuses: EvaluationStatus[] | null) => {
    setEvaluationStatuses(nextStatuses ?? []);
    setCurrentPage(1);
  };

  const { data } = useGetQuery(
    [
      "student-attendance",
      {
        search,
        dateFilter,
        attendanceStatuses,
        evaluationStatuses,
        belts,
        branches,
        scheduleLevels,
        scheduleIds,
        page: currentPage - 1,
        size: PAGE_SIZE,
      },
    ],
    () =>
      studentAttendanceAPI.filter({
        search,
        page: currentPage - 1,
        size: PAGE_SIZE,
        sessionDate: dateFilter ?? undefined,
        attendanceStatuses,
        evaluationStatuses,
        belts,
        branchIds: branches,
        scheduleLevels,
        scheduleIds,
      }),
    {
      enabled:
        !!search ||
        !!dateFilter ||
        !!attendanceStatuses ||
        !!evaluationStatuses ||
        !!belts ||
        !!branches ||
        !!scheduleLevels ||
        !!scheduleIds,
      staleTime: 5 * 60 * 1000,
    },
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
  const currentPageAttendanceIds = useMemo(
    () =>
      (data?.attendances.content ?? [])
        .map((row) => row.attendanceId)
        .filter((attendanceId): attendanceId is string =>
          Boolean(attendanceId),
        ),
    [data?.attendances.content],
  );
  const selectedAttendanceIdsOnPage = useMemo(() => {
    const currentPageAttendanceIdSet = new Set(currentPageAttendanceIds);

    return selectedAttendanceIds.filter((attendanceId) =>
      currentPageAttendanceIdSet.has(attendanceId),
    );
  }, [currentPageAttendanceIds, selectedAttendanceIds]);

  const deletePreviewItems = useMemo(() => {
    const attendanceById = new Map(
      (data?.attendances.content ?? [])
        .filter(
          (row): row is StudentAttendanceResponse & { attendanceId: string } =>
            Boolean(row.attendanceId),
        )
        .map((row) => [row.attendanceId, row]),
    );

    return deleteTargetIds.map((attendanceId) => {
      const base = attendanceById.get(attendanceId);
      const edited = editedRows[attendanceId];

      const attendanceStatus =
        edited?.attendanceStatus ?? base?.attendanceStatus ?? "ABSENT";
      const evaluationStatus =
        edited?.evaluationStatus ?? base?.evaluationStatus ?? null;
      const note = edited?.note ?? base?.note ?? null;

      return {
        attendanceId,
        studentName: base?.studentName ?? "Học viên không xác định",
        sessionDate: base?.sessionDate ?? null,
        classScheduleId: base?.classScheduleId ?? "—",
        attendanceStatus,
        evaluationStatus,
        note,
      };
    });
  }, [data?.attendances.content, deleteTargetIds, editedRows]);

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

  const handleToggleSelectRow = (attendanceId: string) => {
    setSelectedAttendanceIds((prev) =>
      prev.includes(attendanceId)
        ? prev.filter((id) => id !== attendanceId)
        : [...prev, attendanceId],
    );
  };

  const handleSelectAllRows = (checked: boolean) => {
    setSelectedAttendanceIds(checked ? currentPageAttendanceIds : []);
  };

  const openDeleteConfirmForMany = () => {
    if (selectedAttendanceIdsOnPage.length === 0) {
      return;
    }

    setDeleteTargetIds(selectedAttendanceIdsOnPage);
    setIsDeleteConfirmOpen(true);
  };

  const openDeleteConfirmForSingle = (attendanceId: string) => {
    setDeleteTargetIds([attendanceId]);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteAttendance = async () => {
    if (deleteTargetIds.length === 0) {
      setIsDeleteConfirmOpen(false);
      return;
    }

    await deleteAttendanceBatch(deleteTargetIds);

    const deleteTargetIdSet = new Set(deleteTargetIds);
    setEditedRows((prev) => {
      const nextEditedRows = { ...prev };

      deleteTargetIds.forEach((attendanceId) => {
        delete nextEditedRows[attendanceId];
      });

      return nextEditedRows;
    });
    setSelectedAttendanceIds((prev) =>
      prev.filter((attendanceId) => !deleteTargetIdSet.has(attendanceId)),
    );
    setDeleteTargetIds([]);
    setIsDeleteConfirmOpen(false);
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
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
        <button
          type="button"
          onClick={openDeleteConfirmForMany}
          disabled={selectedAttendanceIdsOnPage.length === 0 || isDeleting}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            height: "36px",
            padding: "0 12px",
            borderRadius: "8px",
            border: "1px solid #FCA5A5",
            background: "#FEF2F2",
            color: "#B91C1C",
            cursor:
              selectedAttendanceIdsOnPage.length === 0 || isDeleting
                ? "not-allowed"
                : "pointer",
            opacity:
              selectedAttendanceIdsOnPage.length === 0 || isDeleting ? 0.6 : 1,
          }}
          title="Xóa các bản ghi đã chọn"
        >
          <Trash2 size={15} />
          <span style={{ fontSize: "12px", fontWeight: 600 }}>
            Xóa ({selectedAttendanceIdsOnPage.length})
          </span>
        </button>
      </div>
      <AttendanceTable
        data={data}
        currentPage={currentPage}
        pageSize={data?.attendances.size || PAGE_SIZE}
        setCurrentPage={setCurrentPage}
        selectedAttendanceIds={selectedAttendanceIdsOnPage}
        onToggleSelect={handleToggleSelectRow}
        onSelectAll={handleSelectAllRows}
        editedRows={editedRows}
        onAttendanceChange={handleAttendanceChange}
        onEvaluationChange={handleEvaluationChange}
        onNoteChange={handleNoteChange}
        onUndoRow={handleUndoRow}
        onDeleteRow={openDeleteConfirmForSingle}
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

      <ConfirmModal
        open={isDeleteConfirmOpen}
        title={
          deleteTargetIds.length > 1 ? "Xóa điểm danh đã chọn" : "Xóa điểm danh"
        }
        description={
          deleteTargetIds.length > 1
            ? `Bạn sắp xóa ${deleteTargetIds.length} bản ghi điểm danh. Thao tác này không thể hoàn tác.`
            : "Bạn sắp xóa bản ghi điểm danh này. Thao tác này không thể hoàn tác."
        }
        confirmText="Xóa"
        loadingText="Đang xóa..."
        isLoading={isDeleting}
        successToastMessage="Xóa điểm danh thành công"
        errorToastMessage="Xóa điểm danh thất bại"
        onCancel={() => {
          if (isDeleting) {
            return;
          }
          setIsDeleteConfirmOpen(false);
          setDeleteTargetIds([]);
        }}
        onConfirm={handleDeleteAttendance}
      >
        <div className={styles.deletePreviewWrap}>
          <p className={styles.deletePreviewTitle}>
            Danh sách lịch sử điểm danh sắp bị xóa
          </p>

          {deletePreviewItems.length === 0 ? (
            <p className={styles.deletePreviewEmpty}>
              Không có dữ liệu để hiển thị.
            </p>
          ) : (
            <ul className={styles.deletePreviewList}>
              {deletePreviewItems.map((item) => (
                <li
                  key={item.attendanceId}
                  className={styles.deletePreviewItem}
                >
                  <div className={styles.deletePreviewHeader}>
                    <p className={styles.deletePreviewStudentName}>
                      {item.studentName}
                    </p>
                    <span className={styles.deletePreviewSchedule}>
                      {item.classScheduleId}
                    </span>
                  </div>

                  <div className={styles.deletePreviewMeta}>
                    <span>
                      Ngày học:{" "}
                      {item.sessionDate ? formatDateDMY(item.sessionDate) : "-"}
                    </span>
                  </div>

                  <div className={styles.deletePreviewMeta}>
                    <span>
                      Điểm danh: {AttendanceStatusLabel[item.attendanceStatus]}
                    </span>
                    <span>
                      Đánh giá:{" "}
                      {item.evaluationStatus
                        ? EvaluationStatusLabel[item.evaluationStatus]
                        : "-"}
                    </span>
                  </div>

                  <p className={styles.deletePreviewNote}>
                    Ghi chú: {item.note?.trim() ? item.note : "-"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ConfirmModal>
    </div>
  );
}
