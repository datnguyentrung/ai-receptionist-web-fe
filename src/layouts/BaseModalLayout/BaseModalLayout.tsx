import { ModalLayout } from "@/components/ui/modal-layout";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./BaseModalLayout.module.scss";

interface BaseModalLayoutProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  isLoading?: boolean;
  maxWidth?: number | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: 480,
  md: 640,
  lg: 960,
};

export function BaseModalLayout({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  isLoading = false,
  maxWidth,
  size = "md",
  className = "",
}: BaseModalLayoutProps) {
  const width = maxWidth ?? sizeMap[size];

  return (
    <ModalLayout
      open={open}
      onClose={onClose}
      showCloseButton={false}
      closeOnBackdrop={closeOnBackdrop && !isLoading}
      closeOnEscape={closeOnEscape && !isLoading}
      withSurface={true}
      maxWidth={width}
      overlayClassName={`${styles.overlay} ${isLoading ? styles.overlayLoading : ""}`}
      surfaceClassName={`${styles.surface} ${className}`}
      bodyClassName={styles.body}
    >
      <div className={styles.header}>
        <div className={styles.titleSection}>
          {typeof title === "string" ? (
            <h2 className={styles.title}>{title}</h2>
          ) : (
            <div className={styles.title}>{title}</div>
          )}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {showCloseButton && (
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isLoading}
            aria-label="Đóng modal"
            type="button"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className={styles.content}>{children}</div>

      {footer && <div className={styles.footer}>{footer}</div>}
    </ModalLayout>
  );
}
