import ConfirmModal from "@/components/ConfirmModal";
import { CountdownBadge } from "@/components/CountdownBadge/CountdownBadge";
import { MiniActionPopover } from "@/components/ui/mini-action-popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SessionStatusLabel,
  type SessionStatus,
} from "@/config/constants/OperationEnums";
import type { PageResponse, SessionResponse } from "@/types";
import { formatTimeStringHM } from "@/utils/format";
import { getLabelClassSchedule } from "@/utils/getInitials";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Pause,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { classSessionAPI } from "../../api/classSessionAPI";
import styles from "./SessionLayout.module.scss";

const STATUS_TRANSITIONS: Record<
  SessionStatus,
  Array<{
    status: SessionStatus;
    label: string;
    icon: React.ElementType;
    isDanger?: boolean;
  }>
> = {
  SCHEDULED: [
    { status: "ACTIVE", label: "Bắt đầu buổi học", icon: Clock },
    {
      status: "CANCELLED",
      label: "Hủy buổi học",
      icon: XCircle,
      isDanger: true,
    },
    { status: "POSTPONED", label: "Hoãn buổi học", icon: Pause },
  ],
  ACTIVE: [
    { status: "COMPLETED", label: "Hoàn thành buổi học", icon: CheckCircle2 },
    { status: "POSTPONED", label: "Hoãn buổi học", icon: Pause },
  ],
  COMPLETED: [{ status: "SCHEDULED", label: "Lên lịch lại", icon: Clock }],
  CANCELLED: [{ status: "SCHEDULED", label: "Lên lịch lại", icon: Clock }],
  POSTPONED: [
    { status: "SCHEDULED", label: "Lên lịch lại", icon: Clock },
    {
      status: "CANCELLED",
      label: "Hủy buổi học",
      icon: XCircle,
      isDanger: true,
    },
  ],
  TERMINATED: [{ status: "SCHEDULED", label: "Lên lịch lại", icon: Clock }],
};

interface SessionLayoutProps {
  sessions?: PageResponse<SessionResponse>;
  isLoading?: boolean;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSessionUpdated?: () => void;
  highlightSessionId?: string | null;
  onHighlightHandled?: () => void;
}

export function SessionLayout({
  sessions,
  isLoading = false,
  currentPage = 1,
  onPageChange,
  onSessionUpdated,
  highlightSessionId,
  onHighlightHandled,
}: SessionLayoutProps) {
  const [pendingUpdate, setPendingUpdate] = useState<{
    sessionId: string;
    newStatus: SessionStatus;
    label: string;
    isDanger?: boolean;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateNote, setUpdateNote] = useState("");
  const [localSessions, setLocalSessions] = useState<SessionResponse[]>([]);

  // Thêm 3 state mới này:
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [inlineNoteValue, setInlineNoteValue] = useState("");
  const [isSavingInline, setIsSavingInline] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<SessionResponse | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [flashSessionId, setFlashSessionId] = useState<string | null>(null);

  const registerItemRef = useCallback(
    (sessionId: string) => (element: HTMLDivElement | null) => {
      itemRefs.current[sessionId] = element;
    },
    [],
  );

  const visibleSessionIds = useMemo(
    () => new Set(localSessions.map((s) => s.sessionId)),
    [localSessions],
  );

  useEffect(() => {
    setLocalSessions(sessions?.content ?? []);
  }, [sessions]);

  useEffect(() => {
    if (!highlightSessionId) return;

    if (!visibleSessionIds.has(highlightSessionId)) {
      return;
    }

    const element = itemRefs.current[highlightSessionId];
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setFlashSessionId(highlightSessionId);
    onHighlightHandled?.();

    const timeoutId = window.setTimeout(() => {
      setFlashSessionId((prev) => (prev === highlightSessionId ? null : prev));
    }, 1600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [highlightSessionId, onHighlightHandled, visibleSessionIds]);

  const isNoteRequired =
    pendingUpdate?.newStatus === "CANCELLED" ||
    pendingUpdate?.newStatus === "POSTPONED";

  const closeModal = useCallback(() => {
    setPendingUpdate(null);
    setUpdateNote("");
  }, []);

  const getPopoverActions = useCallback((session: SessionResponse) => {
    const transitions =
      STATUS_TRANSITIONS[session.status as SessionStatus] || [];
    return transitions.map((t) => ({
      id: t.status,
      label: t.label,
      icon: t.icon,
      isDanger: t.isDanger,
    }));
  }, []);

  const handleActionSelect = useCallback(
    (session: SessionResponse, actionId: string) => {
      const transition = STATUS_TRANSITIONS[
        session.status as SessionStatus
      ]?.find((t) => t.status === actionId);
      if (!transition) return;

      // Điền sẵn note cũ vào ô input để tránh bị mất data
      setUpdateNote(session.note || "");

      setPendingUpdate({
        sessionId: session.sessionId,
        newStatus: actionId as SessionStatus,
        label: transition.label,
        isDanger: transition.isDanger,
      });
    },
    [],
  );

  const confirmStatusChange = useCallback(async () => {
    if (!pendingUpdate) return;
    if (isNoteRequired && !updateNote.trim()) return;
    setIsUpdating(true);
    try {
      await classSessionAPI.updateSession(pendingUpdate.sessionId, {
        status: pendingUpdate.newStatus,
        note: updateNote.trim(),
      });
      setLocalSessions((prev) =>
        prev.map((s) =>
          s.sessionId === pendingUpdate.sessionId
            ? {
                ...s,
                status: pendingUpdate.newStatus,
                note: updateNote.trim(),
              }
            : s,
        ),
      );
      closeModal();
      onSessionUpdated?.();
    } finally {
      setIsUpdating(false);
    }
  }, [pendingUpdate, updateNote, isNoteRequired, closeModal, onSessionUpdated]);

  const closeDeleteModal = useCallback(() => {
    if (isDeleting) return;
    setPendingDelete(null);
  }, [isDeleting]);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await classSessionAPI.deleteSession(pendingDelete.sessionId);
      setLocalSessions((prev) =>
        prev.filter((s) => s.sessionId !== pendingDelete.sessionId),
      );
      setPendingDelete(null);
      onSessionUpdated?.();
    } finally {
      setIsDeleting(false);
    }
  }, [onSessionUpdated, pendingDelete]);

  // 1. Mở ô input khi click đúp
  const handleDoubleClickNote = useCallback((session: SessionResponse) => {
    setEditingNoteId(session.sessionId);
    setInlineNoteValue(session.note || ""); // Điền sẵn note hiện tại vào input
  }, []);

  // 2. Hủy chỉnh sửa (nhấn nút Esc)
  const handleCancelInlineEdit = useCallback(() => {
    setEditingNoteId(null);
    setInlineNoteValue("");
  }, []);

  // 3. Gọi API lưu Note mới (khi nhấn Enter hoặc click ra ngoài ô input)
  const handleSaveInlineNote = useCallback(
    async (session: SessionResponse) => {
      const newNote = inlineNoteValue.trim();

      // Nếu nội dung không thay đổi thì đóng input lại, không gọi API cho đỡ tốn tài nguyên
      if (newNote === (session.note || "").trim()) {
        handleCancelInlineEdit();
        return;
      }

      setIsSavingInline(true);
      try {
        await classSessionAPI.updateSession(session.sessionId, {
          status: session.status as SessionStatus, // Giữ nguyên trạng thái cũ
          note: newNote,
        });

        // Cập nhật lại UI ngay lập tức
        setLocalSessions((prev) =>
          prev.map((s) =>
            s.sessionId === session.sessionId ? { ...s, note: newNote } : s,
          ),
        );
        handleCancelInlineEdit();
        onSessionUpdated?.();
      } catch (error) {
        console.error("Lỗi khi cập nhật note trực tiếp:", error);
        // Tùy chọn: Thêm thông báo lỗi (Toast) ở đây nếu cần
      } finally {
        setIsSavingInline(false);
      }
    },
    [inlineNoteValue, handleCancelInlineEdit, onSessionUpdated],
  );

  if (isLoading) {
    return (
      <div className={styles.container}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className={styles.sessionItemSkeleton}>
            <Skeleton className={styles.skeletonDate} />
            <Skeleton className={styles.skeletonTime} />
            <Skeleton className={styles.skeletonClass} />
          </div>
        ))}
      </div>
    );
  }

  if (!sessions || sessions.empty || !sessions.content?.length) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📚</div>
        <h3 className={styles.emptyTitle}>Không có buổi học sắp diễn ra</h3>
        <p className={styles.emptyDescription}>
          Tất cả các buổi học đã được kiểm tra hoặc không có buổi nào sắp diễn
          ra
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.sessionList}>
        {localSessions.map((session) => (
          <div
            key={session.sessionId}
            ref={registerItemRef(session.sessionId)}
            className={`${styles.sessionItem} ${flashSessionId === session.sessionId ? styles.sessionItemHighlighted : ""}`}
          >
            <div className={styles.sessionHeader}>
              <div className={styles.dateTimeInfo}>
                <div className={styles.date}>
                  {session.sessionDate
                    ? format(new Date(session.sessionDate), "dd MMM yyyy", {
                        locale: vi,
                      })
                    : "N/A"}
                </div>
                {session.startTime && (
                  <div className={styles.time}>
                    <Clock size={14} />
                    {formatTimeStringHM(session.startTime)}
                    {session.endTime &&
                      ` - ${formatTimeStringHM(session.endTime)}`}
                  </div>
                )}
              </div>

              <div className={styles.headerActions}>
                <div className={styles.statusBadge}>
                  {session.isAttendanceClosed ||
                  session.status === "COMPLETED" ? null : (
                    <span className={styles.active}>
                      <CountdownBadge
                        sessionDate={session.sessionDate}
                        startTime={session.startTime}
                        endTime={session.endTime}
                      />
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => setPendingDelete(session)}
                  aria-label="Xóa buổi học"
                  title="Xóa buổi học"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className={styles.sessionBody}>
              <div className={styles.classInfoContainer}>
                <div className={styles.classInfo}>
                  <MapPin size={14} />
                  <div>
                    <div className={styles.className}>
                      {session.classSchedule?.scheduleId || "N/A"}
                    </div>
                    {(() => {
                      const scheduleId = session.classSchedule?.scheduleId;
                      if (!scheduleId) return null;
                      const derivedLabel =
                        getLabelClassSchedule(scheduleId);
                      if (!derivedLabel || derivedLabel === scheduleId) {
                        return null;
                      }
                      return (
                        <div className={styles.classMeta}>{derivedLabel}</div>
                      );
                    })()}

                  </div>
                </div>
                <MiniActionPopover
                  actions={getPopoverActions(session)}
                  itemLabel={session.classSchedule?.scheduleId}
                  onActionSelect={(actionId) =>
                    handleActionSelect(session, actionId)
                  }
                >
                  <span
                    className={`${styles.sessionStatusBadge} ${session.status ? styles[session.status] : ""}`}
                  >
                    {session.status
                      ? SessionStatusLabel[session.status]
                      : "N/A"}
                  </span>
                </MiniActionPopover>
              </div>

              <div
                className={styles.note}
                onDoubleClick={() => handleDoubleClickNote(session)}
                title="Click đúp để chỉnh sửa ghi chú"
                style={{
                  cursor: "text",
                  display: "flex", // Chuyển sang flex để căn chỉnh
                  gap: "8px", // Tạo khoảng cách giữa chữ "Ghi chú:" và nội dung
                  alignItems: "flex-start", // Giữ chữ "Ghi chú:" luôn ở trên cùng kể cả khi nội dung dài ra nhiều dòng
                }}
              >
                <strong style={{ whiteSpace: "nowrap" }}>Ghi chú:</strong>

                {editingNoteId === session.sessionId ? (
                  <textarea // Đổi từ input sang textarea để hỗ trợ xuống dòng
                    autoFocus
                    disabled={isSavingInline}
                    value={inlineNoteValue}
                    onChange={(e) => setInlineNoteValue(e.target.value)}
                    onBlur={() => handleSaveInlineNote(session)}
                    onKeyDown={(e) => {
                      // Nhấn Enter thông thường sẽ LƯU
                      // Nhấn Shift + Enter để XUỐNG DÒNG
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault(); // Ngăn textarea tự động nhảy xuống dòng
                        handleSaveInlineNote(session);
                      }
                      if (e.key === "Escape") handleCancelInlineEdit();
                    }}
                    style={{
                      flex: 1, // Tương đương 1fr, chiếm toàn bộ không gian còn lại bên phải
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      minHeight: "60px", // Cho textarea một chiều cao tối thiểu nhìn cho dễ
                      resize: "vertical", // Chỉ cho phép người dùng kéo giãn chiều dọc
                      fontFamily: "inherit", // Giữ font chữ đồng bộ với giao diện
                    }}
                  />
                ) : (
                  <span
                    style={{
                      flex: 1, // Để span cũng chiếm hết chỗ trống
                      whiteSpace: "pre-wrap", // CỰC KỲ QUAN TRỌNG: Giúp hiển thị đúng các dấu xuống dòng (Enter) khi render text
                      wordBreak: "break-word", // Tránh bị tràn chữ dài
                    }}
                  >
                    {session.note || (
                      <span style={{ color: "#999", fontStyle: "italic" }}>
                        Chưa có ghi chú
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {sessions.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={sessions.first}
            type="button"
          >
            ← Trước
          </button>

          <div className={styles.pageInfo}>
            Trang {sessions.number + 1} / {sessions.totalPages}
          </div>

          <button
            className={styles.paginationBtn}
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={sessions.last}
            type="button"
          >
            Sau →
          </button>
        </div>
      )}
      <ConfirmModal
        open={pendingUpdate !== null}
        title={
          pendingUpdate?.isDanger
            ? "Xác nhận hủy buổi học"
            : "Xác nhận thay đổi trạng thái"
        }
        description={`Bạn có chắc muốn "${pendingUpdate?.label}" cho buổi học này?`}
        cancelText="Hủy"
        confirmText="Xác nhận"
        loadingText="Đang cập nhật..."
        isLoading={isUpdating}
        onCancel={closeModal}
        onConfirm={confirmStatusChange}
        successToastMessage="Cập nhật trạng thái buổi học thành công"
        errorToastMessage="Không thể cập nhật trạng thái buổi học"
      >
        <div className={styles.noteField}>
          <label className={styles.noteLabel}>
            Lý do / Ghi chú
            {isNoteRequired && <span className={styles.required}> *</span>}
          </label>
          <textarea
            className={styles.noteInput}
            placeholder="Nhập lý do thay đổi trạng thái..."
            value={updateNote}
            onChange={(e) => setUpdateNote(e.target.value)}
            rows={3}
            disabled={isUpdating}
          />
          {isNoteRequired && !updateNote.trim() && (
            <span className={styles.noteError}>Vui lòng nhập lý do</span>
          )}
        </div>
      </ConfirmModal>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Xác nhận xóa buổi học"
        description={`Bạn có chắc muốn xóa buổi học ${pendingDelete?.classSchedule?.scheduleId ?? ""}?`}
        cancelText="Hủy"
        confirmText="Xóa"
        loadingText="Đang xóa..."
        isLoading={isDeleting}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
        successToastMessage="Xóa buổi học thành công"
        errorToastMessage="Không thể xóa buổi học"
      />

      {/* TODO: Thêm input Note vào nữa */}
    </div>
  );
}
