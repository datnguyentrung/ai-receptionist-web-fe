import Avatar from "@/components/Avatar";
import { Pagination } from "@/components/Pagination";
import type { EvaluationStatus } from "@/config/constants";
import { EvaluationStatusLabel } from "@/config/constants";
import { AttendanceBadge } from "@/features/studentAttendance/components/AttendanceBadge/AttendanceBadge";
import { ClipboardList } from "@/features/studentAttendance/components/ClipboardList";
import type { PageResponse, StudentAttendanceResponse } from "@/types";
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
  data: PageResponse<StudentAttendanceResponse> | undefined;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
}

export function AttendanceTable({
  data,
  currentPage,
  pageSize,
  setCurrentPage,
}: Props) {
  const rows = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

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
                <th key={h} className={styles.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((a, index) => (
              <tr key={a.attendanceId} className={styles.tr}>
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
                    }}
                  >
                    {formatDateDMY(a.sessionDate)}
                  </p>
                </td>
                {/* Học viên */}
                <td className={styles.td}>
                  <div className={styles.avatarCell}>
                    <Avatar
                      fullName={a.studentName}
                      fontSize="9px"
                      fontWeight={800}
                      width="32px"
                      height="32px"
                    />
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#111827",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.studentName}
                    </p>
                  </div>
                </td>
                {/* Cơ sở */}
                <td className={styles.td}>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#374151",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Cơ sở {a.classScheduleId.charAt(1)}
                  </p>
                </td>
                {/* Thứ */}
                <td className={styles.td}>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#374151",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Thứ {a.classScheduleId.charAt(2)}
                  </p>
                </td>
                {/* Ca học */}
                <td className={styles.td}>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#374151",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Ca {a.classScheduleId.charAt(4)}
                  </p>
                </td>
                {/* Điểm danh */}
                <td className={styles.td}>
                  <AttendanceBadge status={a.attendanceStatus} />
                </td>
                {/* Đánh giá */}
                <td className={styles.td}>
                  {a.evaluationStatus &&
                  EVALUATION_STYLE[a.evaluationStatus] ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        fontSize: "11px",
                        fontWeight: 500,
                        background: EVALUATION_STYLE[a.evaluationStatus].bg,
                        color: EVALUATION_STYLE[a.evaluationStatus].color,
                      }}
                    >
                      {EvaluationStatusLabel[a.evaluationStatus]}
                    </span>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#D1D5DB" }}>
                      —
                    </span>
                  )}
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
              </tr>
            ))}
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
          currentListLength={data?.totalElements ?? 0}
        />
      )}
    </div>
  );
}
