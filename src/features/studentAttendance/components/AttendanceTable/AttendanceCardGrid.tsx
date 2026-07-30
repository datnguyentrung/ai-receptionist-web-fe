import Avatar from "@/components/common/Avatar";
import { MiniActionPopover } from "@/components/ui/mini-action-popover";
import { showComingSoonActionToast } from "@/components/ui/mini-action-popover.toast";
import type { AttendanceStatus, EvaluationStatus } from "@/config/constants";
import {
  AttendanceStatusLabel,
  EvaluationStatusLabel,
} from "@/config/constants";
import type {
  AttendanceListResponse,
  StudentAttendanceSimpleResponse,
} from "@/types";
import {
  getAttendanceBranchName,
  getAttendanceShiftLabel,
  getAttendanceStudentId,
  getAttendanceStudentName,
  getAttendanceWeekdayLabel,
} from "@/features/studentAttendance/utils/attendanceAccessors";
import { formatDateDMY } from "@/utils/format";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  RotateCcw,
  StickyNote,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import styles from "./AttendanceTable.module.scss";

type AttendanceRow = AttendanceListResponse["attendances"]["content"][number];

interface AttendanceCardGridProps {
  rows: AttendanceRow[];
  currentPage: number;
  pageSize: number;
  selectedAttendanceIds: string[];
  editedRows: Record<string, StudentAttendanceSimpleResponse>;
  onToggleSelect?: (attendanceId: string) => void;
  onAttendanceChange?: (row: AttendanceRow, status: AttendanceStatus) => void;
  onEvaluationChange?: (
    row: AttendanceRow,
    status: EvaluationStatus | null,
  ) => void;
  onNoteChange?: (row: AttendanceRow, note: string | null) => void;
  onUndoRow?: (attendanceId: string) => void;
  onDeleteRow?: (attendanceId: string) => void;
}

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

function getEvaluationClass(status: EvaluationStatus | null | undefined) {
  if (!status) return "";

  return {
    PENDING: styles.evaluationPending,
    GOOD: styles.evaluationGood,
    AVERAGE: styles.evaluationAverage,
    WEAK: styles.evaluationWeak,
  }[status];
}

function getAttendanceClass(status: AttendanceStatus) {
  return {
    PRESENT: styles.attendancePresent,
    LATE: styles.attendanceLate,
    ABSENT: styles.attendanceAbsent,
    MAKEUP: styles.attendanceMakeup,
    EXCUSED: styles.attendanceExcused,
  }[status];
}

function getAttendanceIcon(status: AttendanceStatus) {
  return {
    PRESENT: CheckCircle2,
    LATE: Clock,
    ABSENT: XCircle,
    MAKEUP: Clock,
    EXCUSED: AlertCircle,
  }[status];
}

export function AttendanceCardGrid({
  rows,
  currentPage,
  pageSize,
  selectedAttendanceIds,
  editedRows,
  onToggleSelect,
  onAttendanceChange,
  onEvaluationChange,
  onNoteChange,
  onUndoRow,
  onDeleteRow,
}: AttendanceCardGridProps) {
  const [editingNoteAttendanceId, setEditingNoteAttendanceId] = useState<
    string | null
  >(null);
  const [noteDraft, setNoteDraft] = useState("");
  const selectedAttendanceIdSet = new Set(selectedAttendanceIds);

  const beginNoteEdit = (row: AttendanceRow, note: string | null | undefined) => {
    if (!onNoteChange || !row.attendanceId) return;

    setEditingNoteAttendanceId(row.attendanceId);
    setNoteDraft(note ?? "");
  };

  const commitNoteEdit = (row: AttendanceRow) => {
    if (!onNoteChange || !row.attendanceId) return;

    onNoteChange(row, noteDraft.trim() === "" ? null : noteDraft);
    setEditingNoteAttendanceId(null);
  };

  return (
    <div className={styles.cardGrid} aria-label="Danh sách điểm danh">
      {rows.map((row, index) => {
        const edited = row.attendanceId ? editedRows[row.attendanceId] : null;
        const attendanceStatus =
          edited?.attendanceStatus ?? row.attendanceStatus ?? "ABSENT";
        const evaluationStatus =
          edited?.evaluationStatus ?? row.evaluationStatus;
        const noteValue = edited?.note ?? row.note;
        const hasNote = Boolean(noteValue?.trim());
        const isChanged = Boolean(edited);
        const canEvaluate =
          attendanceStatus === "PRESENT" ||
          attendanceStatus === "MAKEUP" ||
          attendanceStatus === "LATE";
        const blockedEvaluationReason =
          "Chỉ có thể đánh giá khi điểm danh là Có mặt, Học bù hoặc Đi muộn.";
        const cardKey =
          row.attendanceId ??
          `${row.enrollmentId}-${getAttendanceStudentId(row)}-${index}`;
        const AttendanceIcon = getAttendanceIcon(attendanceStatus);
        const evaluationControl = (
          <MiniActionPopover
            triggerClassName={styles.dropdownTrigger}
            contentClassName={styles.attendanceMenuContent}
            disabled={!canEvaluate || !row.attendanceId || !onEvaluationChange}
            title={!canEvaluate ? blockedEvaluationReason : undefined}
            actions={EVALUATION_OPTIONS.filter(
              (status) => status !== "PENDING",
            ).map((status) => ({
              id: status,
              label: EvaluationStatusLabel[status],
            }))}
            onActionSelect={(actionId) => {
              const nextStatus = EVALUATION_OPTIONS.find(
                (status) => status === actionId,
              );
              if (nextStatus) onEvaluationChange?.(row, nextStatus);
            }}
          >
            {evaluationStatus ? (
              <span
                className={`${styles.evaluationBadge} ${getEvaluationClass(
                  evaluationStatus,
                )}`}
              >
                {EvaluationStatusLabel[evaluationStatus]}
              </span>
            ) : (
              <span className={styles.cardMuted}>-</span>
            )}
          </MiniActionPopover>
        );

        return (
          <article
            key={cardKey}
            className={`${styles.attendanceCard} ${getAttendanceClass(
              attendanceStatus,
            )} ${
              isChanged ? styles.attendanceCardChanged : ""
            }`}
          >
            <div className={styles.cardTopBar}>
              <label className={styles.cardSelect}>
                <input
                  type="checkbox"
                  checked={
                    row.attendanceId
                      ? selectedAttendanceIdSet.has(row.attendanceId)
                      : false
                  }
                  disabled={!row.attendanceId}
                  onChange={() => {
                    if (row.attendanceId) onToggleSelect?.(row.attendanceId);
                  }}
                />
                <span>{(currentPage - 1) * pageSize + index + 1}</span>
              </label>

              <MiniActionPopover
                itemLabel={getAttendanceStudentName(row)}
                actions={[
                  { id: "info", label: "Thông tin", icon: Info },
                  { id: "note", label: "Ghi chú", icon: StickyNote },
                  {
                    id: "delete",
                    label: "Xóa điểm danh",
                    icon: Trash2,
                    isDanger: true,
                  },
                ]}
                onActionSelect={(actionId) => {
                  if (actionId === "info") {
                    showComingSoonActionToast(
                      "Thông tin",
                      getAttendanceStudentName(row),
                    );
                    return;
                  }

                  if (actionId === "note") {
                    beginNoteEdit(row, noteValue);
                    return;
                  }

                  if (actionId === "delete" && row.attendanceId) {
                    onDeleteRow?.(row.attendanceId);
                  }
                }}
              />
            </div>

            <div className={styles.cardMain}>
              <div className={styles.cardContent}>
                <div className={styles.cardIdentity}>
                  <div className={styles.cardAvatarWrap}>
                    <Avatar
                      fullName={getAttendanceStudentName(row)}
                      fontSize="12px"
                      fontWeight={800}
                      width="42px"
                      height="42px"
                    />
                  </div>
                  <div className={styles.cardTitleBlock}>
                    <h3 className={styles.cardStudentName}>
                      {getAttendanceStudentName(row)}
                    </h3>
                    <p className={styles.cardDate}>{formatDateDMY(row.sessionDate)}</p>
                  </div>
                </div>

                <dl className={styles.cardMetaGrid}>
                  <div>
                    <dt>Cơ sở</dt>
                    <dd>{getAttendanceBranchName(row)}</dd>
                  </div>
                  <div>
                    <dt>Thứ</dt>
                    <dd>{getAttendanceWeekdayLabel(row)}</dd>
                  </div>
                  <div>
                    <dt>Ca</dt>
                    <dd>{getAttendanceShiftLabel(row)}</dd>
                  </div>
                </dl>
              </div>

              <div className={styles.cardStatusRail}>
                <MiniActionPopover
                  triggerClassName={styles.dropdownTrigger}
                  contentClassName={styles.attendanceMenuContent}
                  disabled={!row.attendanceId || !onAttendanceChange}
                  actions={ATTENDANCE_OPTIONS.map((status) => ({
                    id: status,
                    label: AttendanceStatusLabel[status],
                  }))}
                  onActionSelect={(actionId) => {
                    const nextStatus = ATTENDANCE_OPTIONS.find(
                      (status) => status === actionId,
                    );
                    if (nextStatus) onAttendanceChange?.(row, nextStatus);
                  }}
                >
                  <span className={styles.cardStatusPill}>
                    <AttendanceIcon size={13} />
                    {AttendanceStatusLabel[attendanceStatus]}
                  </span>
                </MiniActionPopover>
              </div>
            </div>

            <div
              className={`${styles.cardFooter} ${
                hasNote || editingNoteAttendanceId === row.attendanceId
                  ? styles.cardFooterWithNote
                  : ""
              }`}
            >
              {hasNote || editingNoteAttendanceId === row.attendanceId ? (
                <div className={styles.cardNoteBlock}>
                  <span className={styles.cardNoteLabel}>Ghi chú</span>
                  {editingNoteAttendanceId === row.attendanceId ? (
                    <input
                      autoFocus
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                      onBlur={() => setEditingNoteAttendanceId(null)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          commitNoteEdit(row);
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          setEditingNoteAttendanceId(null);
                        }
                      }}
                      className={styles.cardNoteInput}
                      placeholder="Nhập ghi chú"
                    />
                  ) : (
                    <button
                      type="button"
                      className={styles.cardNoteText}
                      onClick={() => beginNoteEdit(row, noteValue)}
                      disabled={!onNoteChange || !row.attendanceId}
                    >
                      {noteValue?.trim()}
                    </button>
                  )}
                </div>
              ) : null}
              <div className={styles.cardEvaluationBlock}>
                {evaluationControl}
              </div>
            </div>

            {isChanged && row.attendanceId && onUndoRow ? (
              <button
                type="button"
                className={styles.cardUndoButton}
                onClick={() => onUndoRow(row.attendanceId as string)}
              >
                <RotateCcw size={13} />
                Hoàn tác
              </button>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
