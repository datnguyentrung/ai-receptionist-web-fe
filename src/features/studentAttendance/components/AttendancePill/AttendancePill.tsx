import type { AttendanceStatus } from "@/config/constants";
import { AlertCircle, CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import type { ComponentType, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import styles from "./AttendancePill.module.scss";

const ATTENDANCE_OPTIONS: {
  value: AttendanceStatus;
  label: string;
  short: string;
  icon: ComponentType<{ size: number }>;
}[] = [
  {
    value: "PRESENT",
    label: "Có mặt",
    short: "✓",
    icon: CheckCircle2,
  },
  {
    value: "ABSENT",
    label: "Vắng",
    short: "✗",
    icon: XCircle,
  },
  {
    value: "LATE",
    label: "Muộn",
    short: "~",
    icon: AlertCircle,
  },
];

interface AttendancePillProps {
  attendanceId?: string;
  value: AttendanceStatus | null;
  onChange: (v: AttendanceStatus | null) => void;
}

function isCoarsePointerDevice(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches
  );
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
  value,
  onChange,
}: AttendancePillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedOption, setHighlightedOption] =
    useState<AttendanceStatus | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const activePointerIdRef = useRef<number | null>(null);
  const suppressNextClickRef = useRef(false);

  const disabled = !attendanceId;
  const currentOption = useMemo(
    () => ATTENDANCE_OPTIONS.find((opt) => opt.value === value) ?? null,
    [value],
  );
  const TriggerIcon = currentOption?.icon ?? CircleDashed;
  const triggerLabel = disabled
    ? "Chưa có bản ghi"
    : (currentOption?.label ?? "Chưa điểm danh");
  const stateClass = currentOption
    ? getToneClassName(currentOption.value)
    : styles.unmarked;

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setHighlightedOption(null);
    setIsDragging(false);
    activePointerIdRef.current = null;
  }, []);

  const getOptionFromPoint = useCallback(
    (clientX: number, clientY: number): AttendanceStatus | null => {
      if (typeof document === "undefined") return null;

      const element = document.elementFromPoint(clientX, clientY);
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
      if (disabled) return;
      onChange(nextValue);
    },
    [disabled, onChange],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const isTouchFlow =
      event.pointerType === "touch" || isCoarsePointerDevice();

    if (!isTouchFlow) return;

    event.preventDefault();
    activePointerIdRef.current = event.pointerId;
    suppressNextClickRef.current = true;
    setIsDragging(true);
    setIsOpen(true);
    setHighlightedOption(null);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    event.preventDefault();
    setHighlightedOption(getOptionFromPoint(event.clientX, event.clientY));
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    event.preventDefault();
    const nextValue = getOptionFromPoint(event.clientX, event.clientY);

    if (nextValue) {
      selectOption(nextValue);
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    closeMenu();

    window.setTimeout(() => {
      suppressNextClickRef.current = false;
    }, 0);
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    closeMenu();

    window.setTimeout(() => {
      suppressNextClickRef.current = false;
    }, 0);
  };

  const handleMouseEnter = () => {
    if (disabled || isCoarsePointerDevice()) return;
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isDragging) return;
    setIsOpen(false);
    setHighlightedOption(null);
  };

  return (
    <div
      className={`${styles.pillContainer} ${stateClass} ${
        isOpen ? styles.menuOpen : ""
      } ${disabled ? styles.disabled : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isOpen && !disabled && (
        <div
          className={styles.floatingMenu}
          role="menu"
          aria-label="Chọn điểm danh"
        >
          {ATTENDANCE_OPTIONS.map((opt) => {
            const active = value === opt.value;
            const highlighted = highlightedOption === opt.value;
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
                onClick={() => {
                  if (suppressNextClickRef.current || isCoarsePointerDevice()) {
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
          })}
        </div>
      )}

      <button
        type="button"
        disabled={disabled}
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
        {!disabled && (
          <span className={styles.triggerHint}>
            <span className={styles.desktopHint}>Hover để chọn</span>
            <span className={styles.touchHint}>Giữ và kéo để chọn</span>
          </span>
        )}
      </button>
    </div>
  );
}
