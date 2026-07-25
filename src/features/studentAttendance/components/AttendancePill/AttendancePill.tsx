import type { AttendanceStatus } from "@/config/constants";
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import type { ComponentType, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./AttendancePill.module.scss";

type MenuSelection = AttendanceStatus | "CHECK_IN";

const LONG_PRESS_DELAY_MS = 500;
const LONG_PRESS_MOVE_TOLERANCE_PX = 10;

const ATTENDANCE_OPTIONS: {
  value: AttendanceStatus;
  label: string;
  short: string;
  icon: ComponentType<{ size: number }>;
}[] = [
  { value: "PRESENT", label: "Có mặt", short: "✓", icon: CheckCircle2 },
  { value: "ABSENT", label: "Vắng", short: "✕", icon: XCircle },
  { value: "LATE", label: "Muộn", short: "~", icon: AlertCircle },
];

interface AttendancePillProps {
  attendanceId?: string;
  studentCode?: string;
  value: AttendanceStatus | null;
  onChange: (v: AttendanceStatus | null) => void;
  onCheckIn?: (studentCode: string) => void;
  isCheckInPending?: boolean;
}

function isAttendanceStatus(
  value: string | undefined,
): value is AttendanceStatus {
  return ATTENDANCE_OPTIONS.some((opt) => opt.value === value);
}

function getToneClassName(value: AttendanceStatus): string {
  switch (value) {
    case "PRESENT":
      return styles.present;
    case "ABSENT":
      return styles.absent;
    case "LATE":
      return styles.late;
    default:
      return "";
  }
}

export function AttendancePill({
  attendanceId,
  studentCode,
  value,
  onChange,
  onCheckIn,
  isCheckInPending = false,
}: AttendancePillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedSelection, setHighlightedSelection] =
    useState<MenuSelection | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressActiveRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressNextClickRef = useRef(false);
  const checkInTriggeredRef = useRef(false);

  const currentOption = useMemo(
    () => ATTENDANCE_OPTIONS.find((opt) => opt.value === value) ?? null,
    [value],
  );
  const hasTriggerLabel = !currentOption;
  const statusSelectionDisabled = !hasTriggerLabel && !attendanceId;
  const canCheckIn = Boolean(studentCode?.trim() && onCheckIn);
  const checkInDisabled = !canCheckIn || isCheckInPending;
  const checkInHighlighted =
    highlightedSelection === "CHECK_IN" && !checkInDisabled;
  const canOpenMenu = hasTriggerLabel || !statusSelectionDisabled;
  const TriggerIcon = currentOption?.icon ?? CircleDashed;
  const triggerLabel = !attendanceId
    ? "Chưa có bản ghi"
    : (currentOption?.label ?? "Chưa điểm danh");
  const stateClass = currentOption
    ? getToneClassName(currentOption.value)
    : styles.unmarked;

  useEffect(() => {
    if (!isCheckInPending) {
      checkInTriggeredRef.current = false;
    }
  }, [isCheckInPending]);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearLongPressTimer, [clearLongPressTimer]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setHighlightedSelection(null);
    activePointerIdRef.current = null;
    longPressActiveRef.current = false;
    pointerStartRef.current = null;
  }, []);

  const getOptionFromPoint = useCallback(
    (clientX: number, clientY: number): MenuSelection | null => {
      if (typeof document === "undefined") return null;

      const element = document.elementFromPoint(clientX, clientY);
      const actionElement = element?.closest<HTMLElement>(
        "[data-attendance-action]",
      );
      if (actionElement?.dataset.attendanceAction === "check-in") {
        return "CHECK_IN";
      }

      const optionElement = element?.closest<HTMLElement>(
        "[data-attendance-value]",
      );
      const nextValue = optionElement?.dataset.attendanceValue;

      return isAttendanceStatus(nextValue) ? nextValue : null;
    },
    [],
  );

  const selectOption = useCallback(
    (nextValue: AttendanceStatus) => {
      if (statusSelectionDisabled) return;
      onChange(nextValue);
    },
    [onChange, statusSelectionDisabled],
  );

  const checkIn = useCallback(() => {
    const normalizedStudentCode = studentCode?.trim();
    if (
      !normalizedStudentCode ||
      !onCheckIn ||
      isCheckInPending ||
      checkInTriggeredRef.current
    ) {
      return;
    }

    checkInTriggeredRef.current = true;
    onCheckIn(normalizedStudentCode);
  }, [isCheckInPending, onCheckIn, studentCode]);

  const selectMenuItem = useCallback(
    (selection: MenuSelection) => {
      if (selection === "CHECK_IN") {
        checkIn();
        return;
      }

      selectOption(selection);
    },
    [checkIn, selectOption],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!canOpenMenu || event.button !== 0) return;

    event.preventDefault();
    activePointerIdRef.current = event.pointerId;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    longPressActiveRef.current = false;
    suppressNextClickRef.current = false;
    clearLongPressTimer();

    const trigger = event.currentTarget;
    longPressTimerRef.current = window.setTimeout(() => {
      if (activePointerIdRef.current !== event.pointerId) return;

      longPressActiveRef.current = true;
      suppressNextClickRef.current = true;
      setIsOpen(true);
      setHighlightedSelection(null);
      trigger.setPointerCapture?.(event.pointerId);
    }, LONG_PRESS_DELAY_MS);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    event.preventDefault();
    if (!longPressActiveRef.current) {
      const pointerStart = pointerStartRef.current;
      const movedTooFar =
        pointerStart &&
        Math.hypot(
          event.clientX - pointerStart.x,
          event.clientY - pointerStart.y,
        ) > LONG_PRESS_MOVE_TOLERANCE_PX;

      if (movedTooFar) {
        clearLongPressTimer();
        activePointerIdRef.current = null;
        pointerStartRef.current = null;
      }
      return;
    }

    const nextSelection = getOptionFromPoint(event.clientX, event.clientY);
    setHighlightedSelection(nextSelection);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    event.preventDefault();
    clearLongPressTimer();
    const wasLongPress = longPressActiveRef.current;
    const nextValue = wasLongPress
      ? getOptionFromPoint(event.clientX, event.clientY)
      : null;

    if (nextValue) {
      selectMenuItem(nextValue);
    }

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    closeMenu();

    if (wasLongPress) {
      window.setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 0);
    }
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    clearLongPressTimer();
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    closeMenu();
    suppressNextClickRef.current = false;
  };

  return (
    <div
      className={`${styles.pillContainer} ${stateClass} ${
        isOpen ? styles.menuOpen : ""
      } ${statusSelectionDisabled ? styles.disabled : ""}`}
    >
      {isOpen && canOpenMenu && (
        <div
          className={styles.floatingMenu}
          role="menu"
          aria-label="Chọn điểm danh"
        >
          {hasTriggerLabel ? (
            <button
              type="button"
              role="menuitem"
              data-attendance-action="check-in"
              className={`${styles.menuOption} ${styles.present} ${
                checkInHighlighted ? styles.highlighted : ""
              }`}
              disabled={checkInDisabled}
              aria-busy={isCheckInPending}
              title={
                canCheckIn ? undefined : "Không có mã học viên để điểm danh."
              }
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                if (suppressNextClickRef.current) {
                  return;
                }

                checkIn();
                closeMenu();
              }}
            >
              {isCheckInPending ? (
                <LoaderCircle className={styles.loadingIcon} size={14} />
              ) : (
                <CheckCircle2 size={14} />
              )}
              <span>Điểm danh</span>
            </button>
          ) : (
            ATTENDANCE_OPTIONS.map((opt) => {
              const active = value === opt.value;
              const highlighted = highlightedSelection === opt.value;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  data-attendance-value={opt.value}
                  className={`${styles.menuOption} ${getToneClassName(opt.value)} ${
                    active ? styles.active : ""
                  } ${highlighted ? styles.highlighted : ""}`}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (
                      suppressNextClickRef.current
                    ) {
                      return;
                    }

                    selectOption(opt.value);
                    closeMenu();
                  }}
                >
                  <Icon size={14} />
                  <span>{opt.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}

      <button
        type="button"
        disabled={statusSelectionDisabled}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={styles.triggerBtn}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <span className={styles.statusIcon} aria-hidden="true">
          <TriggerIcon size={16} />
        </span>
        <span className={styles.triggerText}>{triggerLabel}</span>
        {canOpenMenu && (
          <span className={styles.triggerHint}>
            <span className={styles.desktopHint}>Giữ để chọn</span>
            <span className={styles.touchHint}>Giữ và kéo để chọn</span>
          </span>
        )}
      </button>
    </div>
  );
}
