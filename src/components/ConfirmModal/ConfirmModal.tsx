import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../ui/toast";
import styles from "./ConfirmModal.module.scss";

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (!error) {
    return fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object") {
    const maybeError = error as {
      message?: unknown;
      response?: {
        data?: {
          message?: unknown;
          error?: unknown;
        };
      };
    };

    const responseMessage = maybeError.response?.data?.message;
    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }

    const responseError = maybeError.response?.data?.error;
    if (typeof responseError === "string" && responseError.trim()) {
      return responseError;
    }

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }
  }

  return fallbackMessage;
}

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loadingText?: string;
  isLoading?: boolean;
  linkGoToAfterConfirm?: string | null;
  successToastMessage?: string;
  errorToastMessage?: string;
  showSuccessToastOnConfirm?: boolean;
  showErrorToastOnFail?: boolean;
  children?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  loadingText = "Đang xử lý...",
  isLoading = false,
  linkGoToAfterConfirm = null,
  successToastMessage = "Xác nhận thành công",
  errorToastMessage = "Thao tác thất bại. Vui lòng thử lại.",
  showSuccessToastOnConfirm = true,
  showErrorToastOnFail = true,
  children,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const handleConfirm = useCallback(async () => {
    try {
      await Promise.resolve(onConfirm());

      if (showSuccessToastOnConfirm) {
        showSuccessToast(successToastMessage);
      }

      if (linkGoToAfterConfirm) {
        navigate(linkGoToAfterConfirm);
      }
    } catch (error) {
      if (showErrorToastOnFail) {
        showErrorToast(getErrorMessage(error, errorToastMessage));
      }
    }
  }, [
    errorToastMessage,
    linkGoToAfterConfirm,
    navigate,
    onConfirm,
    showErrorToastOnFail,
    showSuccessToastOnConfirm,
    successToastMessage,
  ]);

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
    if (!open) {
      return;
    }

    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!isLoading) {
          onCancel();
        }
      }

      if (event.key === "Enter" && !isLoading) {
        const activeTagName = (document.activeElement as HTMLElement | null)
          ?.tagName;
        if (activeTagName !== "TEXTAREA") {
          event.preventDefault();
          handleConfirm();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleConfirm, isLoading, onCancel, open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className={`${styles.overlay} ${isLoading ? styles.overlayLoading : ""}`}
      onMouseDown={(event) => {
        if (!isLoading && event.target === event.currentTarget) {
          onCancel();
        }
      }}
      aria-hidden={false}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
      >
        <div className={styles.content}>
          <h2 id="confirm-modal-title" className={styles.title}>
            {title}
          </h2>
          {description ? (
            <p id="confirm-modal-description" className={styles.description}>
              {description}
            </p>
          ) : null}
          {children ? <div className={styles.bodySlot}>{children}</div> : null}

          <div className={styles.footer}>
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onCancel}
              className={`${styles.actionButton} ${styles.cancelButton} ${isLoading ? styles.cancelButtonStrong : ""}`}
            >
              {cancelText}
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleConfirm}
              className={`${styles.actionButton} ${styles.confirmButton}`}
              aria-live="polite"
            >
              {isLoading ? (
                <span className={styles.loadingLabel}>
                  <span className={styles.spinner} aria-hidden="true" />
                  {loadingText}
                </span>
              ) : (
                confirmText
              )}
              <span className={styles.visuallyHidden}>
                {isLoading ? "Đang xử lý, vui lòng chờ" : "Sẵn sàng xác nhận"}
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
