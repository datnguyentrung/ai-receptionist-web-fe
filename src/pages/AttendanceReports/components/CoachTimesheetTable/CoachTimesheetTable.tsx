import Avatar from "@/components/common/Avatar";
import { Pagination } from "@/components/common/Pagination";
import {
  CoachTimesheetStatusLabel,
  ScheduleLevelLabel,
  ScheduleShiftLabel,
  WeekdayCodeToLabel,
  type CoachTimesheetStatus,
} from "@/config/constants";
import type { CoachTimesheetListResponse, CoachTimesheetResponse } from "@/types";
import { formatDateDMY, formatTimeHM } from "@/utils/format";
import { ClipboardList, Clock3, TimerReset } from "lucide-react";
import styles from "../AttendanceTable/AttendanceTable.module.scss";

interface CoachTimesheetTableProps {
  data: CoachTimesheetListResponse | undefined;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
}

const TABLE_HEADERS = [
  "#",
  "Ngày làm việc",
  "Coach",
  "Lớp",
  "Cơ sở",
  "Thứ",
  "Ca",
  "Check-in",
  "Check-out",
  "Trạng thái",
  "Ghi chú",
];

function formatOptionalDate(value?: string | null) {
  return value ? formatDateDMY(value) : "-";
}

function formatOptionalTime(value?: string | null) {
  return value ? formatTimeHM(value) : "-";
}

function getStatusClass(status: CoachTimesheetStatus) {
  return {
    PENDING: styles.timesheetPending,
    APPROVED: styles.timesheetApproved,
    REJECTED: styles.timesheetRejected,
  }[status];
}

function getScheduleText(row: CoachTimesheetResponse) {
  const schedule = row.classSchedule;
  const level = schedule?.scheduleLevel
    ? ScheduleLevelLabel[schedule.scheduleLevel]
    : null;

  return [schedule?.scheduleId, level].filter(Boolean).join(" · ") || "-";
}

function getShiftText(row: CoachTimesheetResponse) {
  const schedule = row.classSchedule;
  const shift = schedule?.scheduleShift
    ? ScheduleShiftLabel[schedule.scheduleShift]
    : "Ca";
  const timeRange =
    schedule?.startTime && schedule?.endTime
      ? `${schedule.startTime}-${schedule.endTime}`
      : null;

  return [shift, timeRange].filter(Boolean).join(" · ");
}

function CoachTimesheetStatusBadge({
  status,
}: {
  status: CoachTimesheetStatus;
}) {
  return (
    <span className={`${styles.timesheetStatusBadge} ${getStatusClass(status)}`}>
      {CoachTimesheetStatusLabel[status]}
    </span>
  );
}

function CoachTimesheetCardGrid({
  rows,
  currentPage,
  pageSize,
}: {
  rows: CoachTimesheetResponse[];
  currentPage: number;
  pageSize: number;
}) {
  return (
    <div className={styles.cardGrid} aria-label="Danh sách chấm công coach">
      {rows.map((row, index) => {
        const schedule = row.classSchedule;
        const statusClass = getStatusClass(row.status);

        return (
          <article
            key={row.timesheetId}
            className={`${styles.attendanceCard} ${statusClass}`}
          >
            <div className={styles.cardTopBar}>
              <span className={styles.cardSelect}>
                {(currentPage - 1) * pageSize + index + 1}
              </span>
              <CoachTimesheetStatusBadge status={row.status} />
            </div>

            <div className={styles.cardMain}>
              <div className={styles.cardContent}>
                <div className={styles.cardIdentity}>
                  <div className={styles.cardAvatarWrap}>
                    <Avatar
                      fullName={row.coach?.fullName ?? "Coach"}
                      fontSize="12px"
                      fontWeight={800}
                      width="42px"
                      height="42px"
                    />
                  </div>
                  <div className={styles.cardTitleBlock}>
                    <h3 className={styles.cardStudentName}>
                      {row.coach?.fullName ?? "Coach chưa xác định"}
                    </h3>
                    <p className={styles.cardDate}>
                      {formatOptionalDate(row.workingDate)}
                    </p>
                  </div>
                </div>

                <dl className={styles.cardMetaGrid}>
                  <div>
                    <dt>Cơ sở</dt>
                    <dd>{schedule?.branchName ?? "-"}</dd>
                  </div>
                  <div>
                    <dt>Thứ</dt>
                    <dd>{WeekdayCodeToLabel[schedule?.weekday] ?? "-"}</dd>
                  </div>
                  <div>
                    <dt>Ca</dt>
                    <dd>{getShiftText(row)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.cardNoteBlock}>
                <button type="button" className={styles.cardNoteText} disabled>
                  {row.note?.trim() || getScheduleText(row)}
                </button>
              </div>
              <div className={styles.coachTimeRow}>
                <span>
                  <Clock3 size={12} />
                  {formatOptionalTime(row.checkInTime)}
                </span>
                <span>
                  <TimerReset size={12} />
                  {formatOptionalTime(row.checkOutTime)}
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function CoachTimesheetTable({
  data,
  currentPage,
  pageSize,
  setCurrentPage,
}: CoachTimesheetTableProps) {
  const rows = data?.timesheets.content ?? [];
  const totalPages = data?.timesheets.totalPages ?? 1;

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {TABLE_HEADERS.map((header) => (
                <th
                  key={header}
                  className={
                    header === "Coach"
                      ? `${styles.th} ${styles.studentCol}`
                      : styles.th
                  }
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const schedule = row.classSchedule;

              return (
                <tr key={row.timesheetId} className={styles.tr}>
                  <td className={styles.td}>
                    <p className={styles.cellIndex}>
                      {(currentPage - 1) * pageSize + index + 1}
                    </p>
                  </td>
                  <td className={styles.td}>
                    <p className={styles.cellText}>
                      {formatOptionalDate(row.workingDate)}
                    </p>
                  </td>
                  <td className={`${styles.td} ${styles.studentCol}`}>
                    <div className={styles.avatarCell}>
                      <Avatar
                        fullName={row.coach?.fullName ?? "Coach"}
                        fontSize="9px"
                        fontWeight={800}
                        width="32px"
                        height="32px"
                      />
                      <div className={styles.coachIdentityText}>
                        <p className={styles.studentName}>
                          {row.coach?.fullName ?? "Coach chưa xác định"}
                        </p>
                        <span>{row.coach?.staffCode ?? "-"}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <p className={styles.cellText}>{getScheduleText(row)}</p>
                  </td>
                  <td className={styles.td}>
                    <p className={styles.cellText}>
                      {schedule?.branchName ?? "-"}
                    </p>
                  </td>
                  <td className={styles.td}>
                    <p className={styles.cellText}>
                      {WeekdayCodeToLabel[schedule?.weekday] ?? "-"}
                    </p>
                  </td>
                  <td className={styles.td}>
                    <p className={styles.cellText}>{getShiftText(row)}</p>
                  </td>
                  <td className={styles.td}>
                    <p className={styles.cellText}>
                      {formatOptionalTime(row.checkInTime)}
                    </p>
                  </td>
                  <td className={styles.td}>
                    <p className={styles.cellText}>
                      {formatOptionalTime(row.checkOutTime)}
                    </p>
                  </td>
                  <td className={styles.td} style={{ textAlign: "center" }}>
                    <CoachTimesheetStatusBadge status={row.status} />
                  </td>
                  <td className={styles.td}>
                    <p
                      className={`${styles.cellText} ${
                        row.note?.trim() ? "" : styles.cellMuted
                      }`}
                    >
                      {row.note?.trim() || "-"}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length > 0 ? (
        <CoachTimesheetCardGrid
          rows={rows}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      ) : null}

      {rows.length === 0 ? (
        <div className={styles.emptyState}>
          <ClipboardList
            size={36}
            style={{ color: "#D1D5DB", margin: "0 auto 8px" }}
          />
          <p className={styles.emptyText}>Không có dữ liệu chấm công coach</p>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          currentListLength={data?.timesheets.totalElements ?? 0}
        />
      ) : null}
    </div>
  );
}
