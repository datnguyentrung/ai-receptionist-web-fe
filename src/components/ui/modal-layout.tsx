import { X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import styles from "./modal-layout.module.scss";
import { cn } from "./utils";

type ModalLayoutProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  withSurface?: boolean;
  maxWidth?: number | string;
  overlayClassName?: string;
  dialogClassName?: string;
  surfaceClassName?: string;
  bodyClassName?: string;
  showMobileHandle?: boolean;
  closeOnDragDown?: boolean;
};

function toCssMaxWidth(value: number | string | undefined): string | undefined {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
}

export function ModalLayout({
  open,
  onClose,
  children,
  title,
  subtitle,
  footer,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  withSurface = true,
  maxWidth = 960,
  overlayClassName,
  dialogClassName,
  surfaceClassName,
  bodyClassName,
  showMobileHandle = true,
  closeOnDragDown = false,
}: ModalLayoutProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartYRef = useRef<number | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEscape) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOnEscape, onClose, open]);

  if (!open) {
    return null;
  }

  const dialogStyle: CSSProperties = {
    maxWidth: toCssMaxWidth(maxWidth),
    transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
    transition: dragOffset > 0 ? "none" : undefined,
  };

  const resetDrag = () => {
    dragStartYRef.current = null;
    dragPointerIdRef.current = null;
    dragOffsetRef.current = 0;
    setDragOffset(0);
  };

  const handleDialogPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!closeOnDragDown) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (!target?.closest("[data-modal-drag-handle='true']")) {
      return;
    }

    dragStartYRef.current = event.clientY;
    dragPointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDialogPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (
      !closeOnDragDown ||
      dragStartYRef.current === null ||
      dragPointerIdRef.current !== event.pointerId
    ) {
      return;
    }

    const nextOffset = Math.max(0, event.clientY - dragStartYRef.current);
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  };

  const handleDialogPointerEnd = (event: PointerEvent<HTMLElement>) => {
    if (
      !closeOnDragDown ||
      dragStartYRef.current === null ||
      dragPointerIdRef.current !== event.pointerId
    ) {
      return;
    }

    if (dragOffsetRef.current >= 80) {
      resetDrag();
      onClose();
      return;
    }

    resetDrag();
  };

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdrop) {
      return;
    }

    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className={cn(styles.overlay, overlayClassName)}
      onMouseDown={handleBackdropMouseDown}
      aria-hidden={false}
    >
      <section
        className={cn(styles.dialog, dialogClassName)}
        style={dialogStyle}
        role="dialog"
        aria-modal="true"
        onPointerDown={handleDialogPointerDown}
        onPointerMove={handleDialogPointerMove}
        onPointerUp={handleDialogPointerEnd}
        onPointerCancel={handleDialogPointerEnd}
      >
        {/* Drag handle — visible on mobile, hidden on desktop */}
        {showMobileHandle ? (
          <div
            className={styles.handle}
            aria-hidden="true"
            data-modal-drag-handle="true"
          >
            <div className={styles.handleBar} />
          </div>
        ) : null}

        {withSurface ? (
          <div className={cn(styles.surface, surfaceClassName)}>
            {(title || subtitle || showCloseButton) && (
              <header className={styles.header}>
                <div>
                  {title ? <h2 className={styles.title}>{title}</h2> : null}
                  {subtitle ? (
                    <p className={styles.subtitle}>{subtitle}</p>
                  ) : null}
                </div>
                {showCloseButton ? (
                  <button
                    type="button"
                    className={styles.closeBtn}
                    aria-label="Đóng"
                    onClick={onClose}
                  >
                    <X size={16} />
                  </button>
                ) : null}
              </header>
            )}

            <div className={cn(styles.body, bodyClassName)}>{children}</div>

            {footer ? (
              <footer className={styles.footer}>{footer}</footer>
            ) : null}
          </div>
        ) : (
          children
        )}
      </section>
    </div>,
    document.body,
  );
}
