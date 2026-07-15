import ConfirmModal from "@/components/ConfirmModal";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import {
  SessionStatusLabel,
  type SessionStatus,
} from "@/config/constants/OperationEnums";
import { classSessionAPI } from "@/features/classSession/api/classSessionAPI";
import baseModalStyles from "@/layouts/BaseModalLayout/BaseModalLayout.module.scss";
import type {
  ClassScheduleDetail,
  SessionCreateRequest,
  SessionResponse,
} from "@/types";
import { getLabelClassSchedule } from "@/utils/getInitials";
import { addDays, format } from "date-fns";
import { ArrowLeft, CalendarIcon, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./CreateSessionModal.module.scss";

type CreateSessionVariant = "panel" | "embedded";
type ConfirmationMode = "modal" | "inline";

type Props = {
  open: boolean;
  className?: string;
  classSchedules: ClassScheduleDetail[];
  initialScheduleId?: string;
  onRequestClose: () => void;
  onSessionCreated?: (session: SessionResponse) => void;
  variant?: CreateSessionVariant;
  showBackButton?: boolean;
  onBack?: () => void;
  confirmationMode?: ConfirmationMode;
  onBusyChange?: (busy: boolean) => void;
};

export function CreateSessionModal({
  open,
  className = "",
  classSchedules,
  initialScheduleId,
  onRequestClose,
  onSessionCreated,
  variant = "panel",
  showBackButton = false,
  onBack,
  confirmationMode = "modal",
  onBusyChange,
}: Props) {
  const todayIso = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const wasOpenRef = useRef(false);

  const [scheduleId, setScheduleId] = useState("");
  const [sessionDate, setSessionDate] = useState(todayIso);
  const [sessionDateDirty, setSessionDateDirty] = useState(false);
  const [status, setStatus] = useState<SessionStatus>("SCHEDULED");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const busy = isCreating;
  const isEmbedded = variant === "embedded";
  const usesInlineConfirmation = confirmationMode === "inline";

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  useEffect(() => {
    return () => {
      onBusyChange?.(false);
    };
  }, [onBusyChange]);

  const selectedSchedule = useMemo(() => {
    const trimmed = scheduleId.trim();
    if (!trimmed) return null;
    return classSchedules.find((s) => s.scheduleId === trimmed) ?? null;
  }, [classSchedules, scheduleId]);

  const getNearestDateIsoForBackendWeekday = useCallback(
    (backendWeekday?: number | null) => {
      if (!backendWeekday) return todayIso;

      // Backend mapping in this project:
      // Sunday = 1, Monday = 2, ..., Saturday = 7
      const targetJsDay = backendWeekday === 1 ? 0 : backendWeekday - 1;
      const base = new Date();
      const baseJsDay = base.getDay();

      const delta = (targetJsDay - baseJsDay + 7) % 7;
      return format(addDays(base, delta), "yyyy-MM-dd");
    },
    [todayIso],
  );

  useEffect(() => {
    let cancelled = false;

    if (!open) {
      wasOpenRef.current = false;
      setIsCreateConfirmOpen(false);
      return;
    }

    if (wasOpenRef.current) return;
    wasOpenRef.current = true;

    setSessionDateDirty(false);

    const initialTrimmed = initialScheduleId?.trim();
    const initialSchedule = initialTrimmed
      ? (classSchedules.find((s) => s.scheduleId === initialTrimmed) ?? null)
      : null;

    window.queueMicrotask(() => {
      if (cancelled) return;

      setSessionDate(
        getNearestDateIsoForBackendWeekday(initialSchedule?.weekday),
      );
      setStatus("SCHEDULED");
      setScheduleId(initialTrimmed || "");
    });

    return () => {
      cancelled = true;
    };
  }, [
    open,
    initialScheduleId,
    classSchedules,
    getNearestDateIsoForBackendWeekday,
  ]);

  useEffect(() => {
    let cancelled = false;

    if (!open) return;

    const next = initialScheduleId?.trim();
    if (!next) return;

    window.queueMicrotask(() => {
      if (cancelled) return;
      setScheduleId((current) => (current.trim() ? current : next));
    });

    return () => {
      cancelled = true;
    };
  }, [initialScheduleId, open]);

  useEffect(() => {
    let cancelled = false;

    if (!open) return;
    if (!selectedSchedule) return;
    if (sessionDateDirty) return;

    window.queueMicrotask(() => {
      if (cancelled) return;
      setSessionDate(
        getNearestDateIsoForBackendWeekday(selectedSchedule.weekday),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [
    getNearestDateIsoForBackendWeekday,
    open,
    selectedSchedule,
    sessionDateDirty,
  ]);

  useEffect(() => {
    let cancelled = false;

    window.queueMicrotask(() => {
      if (cancelled) return;

      if (!selectedSchedule) {
        setStartTime("");
        setEndTime("");
        return;
      }

      setStartTime(selectedSchedule.startTime);
      setEndTime(selectedSchedule.endTime);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedSchedule]);

  const scheduleOptions = useMemo(
    () =>
      classSchedules
        .slice()
        .sort((a, b) => a.scheduleId.localeCompare(b.scheduleId))
        .map((s) => ({
          value: s.scheduleId,
          label: getLabelClassSchedule(s.scheduleId),
        })),
    [classSchedules],
  );

  const statusOptions: Array<{ value: SessionStatus; label: string }> = useMemo(
    () =>
      [
        "SCHEDULED",
        "ACTIVE",
        "COMPLETED",
        "CANCELLED",
        "POSTPONED",
        "TERMINATED",
      ].map((s) => ({
        value: s as SessionStatus,
        label: SessionStatusLabel[s as SessionStatus],
      })),
    [],
  );

  const canCreate = Boolean(
    scheduleId.trim() && sessionDate && startTime && endTime,
  );

  const openCreateConfirm = useCallback(() => {
    if (!scheduleId.trim()) {
      showErrorToast("Vui lòng chọn Schedule ID.");
      return;
    }

    if (!selectedSchedule) {
      showErrorToast("Schedule ID không hợp lệ.");
      return;
    }

    if (!sessionDate) {
      showErrorToast("Vui lòng chọn ngày học.");
      return;
    }

    setIsCreateConfirmOpen(true);
  }, [scheduleId, selectedSchedule, sessionDate]);

  const handleCreateSession = useCallback(async () => {
    if (!selectedSchedule) return;

    const payload: SessionCreateRequest = {
      scheduleId: selectedSchedule.scheduleId,
      sessionDate,
      status,
      startTime: selectedSchedule.startTime,
      endTime: selectedSchedule.endTime,
      isAttendanceClosed: false,
    };

    setIsCreating(true);
    try {
      const created = await classSessionAPI.createSession(payload);
      setIsCreateConfirmOpen(false);
      onSessionCreated?.(created);
      setScheduleId("");
      setStartTime("");
      setEndTime("");
    } finally {
      setIsCreating(false);
    }
  }, [onSessionCreated, selectedSchedule, sessionDate, status]);

  const handleInlineCreateSession = useCallback(async () => {
    try {
      await handleCreateSession();
      showSuccessToast("Tạo buổi học thành công");
    } catch {
      showErrorToast("Không thể tạo buổi học");
    }
  }, [handleCreateSession]);

  const closePanel = useCallback(() => {
    if (busy) return;
    onRequestClose();
  }, [busy, onRequestClose]);

  const goBack = useCallback(() => {
    if (busy) return;
    onBack?.();
  }, [busy, onBack]);

  const content = (
    <>
      <div className={isEmbedded ? styles.embeddedHeader : baseModalStyles.header}>
        {isEmbedded && showBackButton ? (
          <button
            type="button"
            className={styles.embeddedIconBtn}
            onClick={goBack}
            disabled={busy}
            aria-label="Quay lại danh sách buổi học"
          >
            <ArrowLeft size={18} />
          </button>
        ) : null}

        <div className={baseModalStyles.titleSection}>
          <h2 className={baseModalStyles.title}>Tạo Buổi Học Mới</h2>
          <p className={baseModalStyles.subtitle}>Tạo một buổi học mới</p>
        </div>

        <button
          className={isEmbedded ? styles.embeddedIconBtn : baseModalStyles.closeBtn}
          onClick={closePanel}
          disabled={busy}
          aria-label="Đóng modal"
          type="button"
        >
          <X size={18} />
        </button>
      </div>

      <div className={isEmbedded ? styles.embeddedContent : baseModalStyles.content}>
        <form className={styles.createForm}>
          <label className={styles.field}>
            <span className={styles.label}>Mã lớp học</span>
            <input
              value={scheduleId}
              onChange={(event) => {
                setScheduleId(event.target.value);
                setIsCreateConfirmOpen(false);
              }}
              list="schedule-id-options"
              placeholder="VD: P14C1"
              disabled={busy}
            />
            <datalist id="schedule-id-options">
              {scheduleOptions.map((opt) => (
                <option key={opt.value} value={opt.value} label={opt.label} />
              ))}
            </datalist>
          </label>

          <div className={styles.field}>
            <span className={styles.label}>Ngày học</span>
            <div className={styles.dateRow}>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`${styles.dateInputBtn} ${!sessionDate ? styles.textMuted : ""}`}
                    disabled={busy}
                  >
                    <CalendarIcon size={16} />
                    {sessionDate ? (
                      format(new Date(sessionDate), "dd/MM/yyyy")
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  className={styles.calendarPopover}
                >
                  <Calendar
                    mode="single"
                    selected={sessionDate ? new Date(sessionDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setSessionDateDirty(true);
                        setIsCreateConfirmOpen(false);
                        setSessionDate(format(date, "yyyy-MM-dd"));
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <button
                type="button"
                className={styles.todayBtn}
                onClick={() => {
                  setSessionDateDirty(true);
                  setIsCreateConfirmOpen(false);
                  setSessionDate(todayIso);
                }}
                disabled={busy}
              >
                Hôm nay
              </button>
            </div>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Trạng thái</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as SessionStatus);
                setIsCreateConfirmOpen(false);
              }}
              disabled={busy}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.timeRow}>
            <label className={styles.field}>
              <span className={styles.label}>Giờ bắt đầu</span>
              <input
                value={startTime}
                type="time"
                onChange={(event) => {
                  setStartTime(event.target.value);
                  setIsCreateConfirmOpen(false);
                }}
                disabled={busy}
                required
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Giờ kết thúc</span>
              <input
                value={endTime}
                type="time"
                onChange={(event) => {
                  setEndTime(event.target.value);
                  setIsCreateConfirmOpen(false);
                }}
                disabled={busy}
                required
              />
            </label>
          </div>
        </form>
      </div>

      <div className={isEmbedded ? styles.embeddedFooter : baseModalStyles.footer}>
        {usesInlineConfirmation && isCreateConfirmOpen ? (
          <div className={styles.inlineConfirm} aria-live="polite">
            <p className={styles.inlineConfirmText}>
              Tạo buổi học cho lớp {scheduleId.trim()} vào ngày {sessionDate}?
            </p>
            <div className={styles.inlineConfirmActions}>
              <button
                type="button"
                className={styles.inlineCancelBtn}
                onClick={() => setIsCreateConfirmOpen(false)}
                disabled={busy}
              >
                Hủy
              </button>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleInlineCreateSession}
                disabled={busy}
              >
                {busy ? "Đang tạo..." : "Tạo"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className={styles.saveBtn}
            onClick={openCreateConfirm}
            disabled={!canCreate || busy}
          >
            Lưu
          </button>
        )}
      </div>
    </>
  );

  return (
    <div
      className={`${
        isEmbedded
          ? styles.embeddedPanel
          : `${baseModalStyles.surface} ${styles.panel}`
      } ${className}`}
      aria-label="Tạo buổi học mới"
    >
      {content}

      {!usesInlineConfirmation ? (
        <ConfirmModal
          open={isCreateConfirmOpen}
          title="Xác nhận tạo buổi học"
          description={`Tạo buổi học cho lớp ${scheduleId.trim()} vào ngày ${sessionDate}?`}
          cancelText="Hủy"
          confirmText="Tạo"
          loadingText="Đang tạo..."
          isLoading={isCreating}
          onCancel={() => {
            if (isCreating) return;
            setIsCreateConfirmOpen(false);
          }}
          onConfirm={handleCreateSession}
          successToastMessage="Tạo buổi học thành công"
          errorToastMessage="Không thể tạo buổi học"
        />
      ) : null}
    </div>
  );
}
