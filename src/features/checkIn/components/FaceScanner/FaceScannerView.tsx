import type React from "react";
import {
  Camera,
  ChevronLeft,
  CircleAlert,
  Loader2,
  RefreshCcw,
  ScanFace,
  SwitchCamera,
  X,
} from "lucide-react";
import logo from "/taekwondo.jpg";
import styles from "./FaceScannerView.module.scss";

interface FaceScannerViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  facingMode: "user" | "environment";
  status:
    | "loading-model"
    | "requesting-camera"
    | "scanning"
    | "submitting"
    | "error";
  errorMessage: string | null;
  isScanning: boolean;
  hasStarted: boolean;
  isSubmitting: boolean;
  retry: () => void;
  switchCamera: () => void;
  cancelPendingCheckIn: () => void;
  onBack?: () => void;
}

const getStatusCopy = (status: FaceScannerViewProps["status"]) => {
  switch (status) {
    case "loading-model":
      return "Đang tải AI nhận diện";
    case "requesting-camera":
      return "Đang mở camera";
    case "submitting":
      return "Đang gửi check-in";
    case "error":
      return "Cần kiểm tra lại";
    default:
      return "Đang nhận diện";
  }
};

export const FaceScannerView = ({
  videoRef,
  canvasRef,
  facingMode,
  status,
  errorMessage,
  isScanning,
  hasStarted,
  isSubmitting,
  retry,
  switchCamera,
  cancelPendingCheckIn,
  onBack,
}: FaceScannerViewProps) => {
  const isReady = status === "scanning" && hasStarted;
  const isBusy = status === "loading-model" || status === "requesting-camera";

  return (
    <section className={styles.wrapper} aria-label="AI khuôn mặt">
      <header className={styles.header}>
        {onBack && (
          <button
            type="button"
            className={styles.backButton}
            onClick={onBack}
            aria-label="Trở về màn hình trước"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
        )}
        <div className={styles.brandBlock}>
          <img src={logo} alt="Taekwondo Văn Quán" className={styles.brandLogo} />
          <div className={styles.heading}>
            <span>PWA SCANNER</span>
            <h1>Nhận diện khuôn mặt</h1>
          </div>
        </div>
        <button
          type="button"
          className={styles.cameraSwitchButton}
          onClick={switchCamera}
          disabled={isBusy || isSubmitting}
          aria-label="Đổi camera"
        >
          <SwitchCamera size={19} aria-hidden="true" />
        </button>
      </header>

      <div className={styles.videoContainer} data-status={status}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`${styles.video} ${facingMode === "user" ? styles.videoMirrored : ""}`}
        />
        <div className={styles.overlay} aria-hidden="true" />
        <div className={`${styles.cornerBracket} ${styles.cornerTL}`} />
        <div className={`${styles.cornerBracket} ${styles.cornerTR}`} />
        <div className={`${styles.cornerBracket} ${styles.cornerBL}`} />
        <div className={`${styles.cornerBracket} ${styles.cornerBR}`} />
        {isScanning && <div className={styles.scanLine} aria-hidden="true" />}

        <div className={styles.statusBadge} role="status" aria-live="polite">
          {isBusy || isSubmitting ? (
            <Loader2 size={14} className={styles.statusSpinner} aria-hidden="true" />
          ) : status === "error" ? (
            <CircleAlert size={14} aria-hidden="true" />
          ) : (
            <ScanFace size={14} aria-hidden="true" />
          )}
          <span>{getStatusCopy(status)}</span>
        </div>

        {!hasStarted && status !== "error" && (
          <div className={styles.waitingState}>
            <Camera size={28} aria-hidden="true" />
            <p>Đặt khuôn mặt vào giữa khung hình</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className={styles.hidden} />

      <div className={styles.helper}>
        {status === "error" ? (
          <>
            <p>{errorMessage}</p>
            <button type="button" className={styles.retryButton} onClick={retry}>
              <RefreshCcw size={18} aria-hidden="true" />
              Thử lại
            </button>
          </>
        ) : isReady ? (
          <p>Giữ khuôn mặt rõ và nhìn thẳng vào camera.</p>
        ) : (
          <p>Camera sẽ tự nhận diện khi khuôn mặt đủ rõ.</p>
        )}
      </div>

      {isSubmitting && (
        <div className={styles.pendingOverlay} role="dialog" aria-modal="true">
          <div className={styles.pendingCard}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={cancelPendingCheckIn}
              aria-label="Hủy yêu cầu check-in"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <Loader2 size={32} className={styles.pendingSpinner} aria-hidden="true" />
            <p className={styles.pendingTitle}>Đang xác nhận check-in</p>
            <p className={styles.pendingSubtitle}>Giữ nguyên khuôn mặt trong khung hình.</p>
          </div>
        </div>
      )}
    </section>
  );
};
