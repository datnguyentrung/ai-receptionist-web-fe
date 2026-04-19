import Avatar from "@/components/Avatar";
import { Pagination } from "@/components/Pagination";
import { MiniActionPopover } from "@/components/ui/mini-action-popover";
import type { AttendanceStatus, EvaluationStatus } from "@/config/constants";
import {
  AttendanceStatusLabel,
  EvaluationStatusLabel,
} from "@/config/constants";
import { AttendanceBadge, ClipboardList } from "@/features/studentAttendance";
import type {
  AttendanceListResponse,
  StudentAttendanceSimpleResponse,
} from "@/types";
import { formatDateDMY } from "@/utils/format";
import styles from "./AttendanceTable.module.scss";

const TABLE_HEADERS = [
  "#", // Số thứ tự
  "Ngày học",
  "Học viên",
  "Cơ sở",
  "Thứ",
  "Ca học",
  "Điểm danh",
  "Đánh giá",
  "Ghi chú",
  "",
];

const EVALUATION_STYLE: Record<
  EvaluationStatus,
  { bg: string; color: string }
> = {
  PENDING: { bg: "#F3F4F6", color: "#6B7280" },
  GOOD: { bg: "#D1FAE5", color: "#065F46" },
  AVERAGE: { bg: "#FEF3C7", color: "#92400E" },
  WEAK: { bg: "#FEE2E2", color: "#991B1B" },
};

interface Props {
  data: AttendanceListResponse | undefined;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  editedRows: Record<string, StudentAttendanceSimpleResponse>;
  onAttendanceChange: (
    row: AttendanceListResponse["attendances"]["content"][number],
    status: AttendanceStatus,
  ) => void;
  onEvaluationChange: (
    row: AttendanceListResponse["attendances"]["content"][number],
    status: EvaluationStatus | null,
  ) => void;
  onUndoRow: (attendanceId: string) => void;
}

export function AttendanceTable({
  data,
  currentPage,
  pageSize,
  setCurrentPage,
  editedRows,
  onAttendanceChange,
  onEvaluationChange,
  onUndoRow,
}: Props) {
  const rows = data?.attendances.content ?? [];
  const totalPages = data?.attendances.totalPages ?? 1;

  const ATTENDANCE_OPTIONS: AttendanceStatus[] = [
    "PRESENT",
    "MAKEUP",
    "LATE",
    "EXCUSED",
    "ABSENT",
  ];

  const EVALUATION_OPTIONS: EvaluationStatus[] = [
    "PENDING",
    "GOOD",
    "AVERAGE",
    "WEAK",
  ];

  const getWorkingRow = (
    row: AttendanceListResponse["attendances"]["content"][number],
  ) => {
    if (!row.attendanceId) {
      return null;
    }
    return editedRows[row.attendanceId] ?? null;
  };

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr
              style={{
                background: "#FAFAFA",
                borderBottom: "1px solid #F3F4F6",
              }}
            >
              {TABLE_HEADERS.map((h) => (
                <th
                  key={h}
                  className={
                    h === "Học viên"
                      ? `${styles.th} ${styles.studentCol}`
                      : styles.th
                  }
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((a, index) => {
              const edited = getWorkingRow(a);
              const attendanceStatus =
                edited?.attendanceStatus ?? a.attendanceStatus;
              const evaluationStatus =
                edited?.evaluationStatus ?? a.evaluationStatus;
              const isChanged = !!edited;
              const attendanceDisplay = attendanceStatus ?? "ABSENT";
              const canEvaluate =
                attendanceStatus === "PRESENT" ||
                attendanceStatus === "MAKEUP" ||
                attendanceStatus === "LATE";
              const blockedEvaluationReason =
                "Chỉ có thể đánh giá khi điểm danh là Có mặt, Học bù hoặc Đi muộn.";

              return (
                <tr
                  key={a.attendanceId ?? `${a.enrollmentId}-${a.studentId}`}
                  className={`${styles.tr} ${isChanged ? styles.changedRow : ""}`}
                >
                  {/* STT */}
                  <td className={styles.td}>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6B7280",
                        textAlign: "center",
                      }}
                    >
                      {(currentPage - 1) * pageSize + index + 1}
                    </p>
                  </td>
                  {/* Ngày học */}
                  <td className={styles.td}>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#374151",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      {formatDateDMY(a.sessionDate)}
                    </p>
                  </td>
                  {/* Học viên */}
                  <td className={`${styles.td} ${styles.studentCol}`}>
                    <div className={styles.avatarCell}>
                      <Avatar
                        fullName={a.studentName}
                        fontSize="9px"
                        fontWeight={800}
                        width="32px"
                        height="32px"
                      />
                      <p className={styles.studentName}>{a.studentName}</p>
                    </div>
                  </td>
                  {/* Cơ sở */}
                  <td className={styles.td}>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#374151",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      Cơ sở {a.classScheduleId?.charAt(1) ?? "—"}
                    </p>
                  </td>
                  {/* Thứ */}
                  <td className={styles.td}>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#374151",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      Thứ {a.classScheduleId?.charAt(2) ?? "—"}
                    </p>
                  </td>
                  {/* Ca học */}
                  <td className={styles.td}>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#374151",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      Ca {a.classScheduleId?.charAt(4) ?? "—"}
                    </p>
                  </td>
                  {/* Điểm danh */}
                  <td className={styles.td} style={{ textAlign: "center" }}>
                    {a.attendanceId ? (
                      <MiniActionPopover
                        triggerClassName={styles.dropdownTrigger}
                        contentClassName={styles.attendanceMenuContent}
                        actions={ATTENDANCE_OPTIONS.map((status) => ({
                          id: status,
                          label: AttendanceStatusLabel[status],
                        }))}
                        onActionSelect={(actionId) => {
                          const nextStatus = ATTENDANCE_OPTIONS.find(
                            (status) => status === actionId,
                          );
                          if (nextStatus) {
                            onAttendanceChange(a, nextStatus);
                          }
                        }}
                      >
                        <AttendanceBadge status={attendanceDisplay} />
                      </MiniActionPopover>
                    ) : (
                      <AttendanceBadge status={attendanceDisplay} />
                    )}
                  </td>
                  {/* Đánh giá */}
                  <td className={styles.td} style={{ textAlign: "center" }}>
                    <MiniActionPopover
                      triggerClassName={styles.dropdownTrigger}
                      contentClassName={styles.attendanceMenuContent}
                      disabled={!canEvaluate || !a.attendanceId}
                      title={!canEvaluate ? blockedEvaluationReason : undefined}
                      actions={[
                        ...EVALUATION_OPTIONS.filter(
                          (status) => status !== "PENDING",
                        ).map((status) => ({
                          id: status,
                          label: EvaluationStatusLabel[status],
                        })),
                        // { id: "__separator__", label: "---" },
                        // { id: "__clear__", label: "Bỏ đánh giá" },
                      ]}
                      onActionSelect={(actionId) => {
                        if (actionId === "__clear__") {
                          onEvaluationChange(a, null);
                          return;
                        }

                        const nextStatus = EVALUATION_OPTIONS.find(
                          (status) => status === actionId,
                        );
                        if (nextStatus) {
                          onEvaluationChange(a, nextStatus);
                        }
                      }}
                    >
                      {evaluationStatus &&
                      EVALUATION_STYLE[evaluationStatus] ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "2px 8px",
                            borderRadius: "9999px",
                            fontSize: "11px",
                            fontWeight: 500,
                            background: EVALUATION_STYLE[evaluationStatus].bg,
                            color: EVALUATION_STYLE[evaluationStatus].color,
                          }}
                        >
                          {EvaluationStatusLabel[evaluationStatus]}
                        </span>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#D1D5DB" }}>
                          —
                        </span>
                      )}
                    </MiniActionPopover>
                  </td>
                  {/* Ghi chú */}
                  <td className={styles.td}>
                    <p
                      style={{
                        fontSize: "12px",
                        color: a.note ? "#374151" : "#D1D5DB",
                      }}
                    >
                      {a.note ?? "—"}
                    </p>
                  </td>

                  {/* Action buttons (e.g., view details) */}
                  <td className={styles.td}>
                    <div className={styles.rowActions}>
                      {isChanged && a.attendanceId ? (
                        <button
                          type="button"
                          className={styles.undoButton}
                          onClick={() => onUndoRow(a.attendanceId as string)}
                        >
                          Undo
                        </button>
                      ) : null}
                      <MiniActionPopover itemLabel={a.studentName} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className={styles.emptyState}>
          <ClipboardList
            size={36}
            style={{ color: "#D1D5DB", margin: "0 auto 8px" }}
          />
          <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
            Không có dữ liệu điểm danh
          </p>
        </div>
      )}
      {rows.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          currentListLength={data?.attendances.totalElements ?? 0}
        />
      )}
    </div>
  );
}
