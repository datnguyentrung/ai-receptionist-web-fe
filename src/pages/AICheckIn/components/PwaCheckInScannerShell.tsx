import type { ReactNode } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  Loader2,
  QrCode,
  RotateCcw,
  ScanFace,
  X,
} from "lucide-react";
import styles from "../AICheckIn.module.scss";
import type { PwaCheckInDisplayResult } from "../utils/checkInDisplayResult";
import logo from "/taekwondo.jpg";

export type {
  PwaCheckInDisplayDetail,
  PwaCheckInDisplayResult,
} from "../utils/checkInDisplayResult";

export type CheckInMode = "FACE_SCAN" | "CODE_SCAN";

export type MobileScanStatus =
  | "ready"
  | "scanning"
  | "code_detected"
  | "submitting"
  | "success"
  | "error"
  | "canceled";

interface PwaCheckInScannerShellProps {
  mode: CheckInMode;
  status: MobileScanStatus;
  statusLabel: string;
  message: string;
  lastScannedCode: string | null;
  successfulScanCount: number;
  displayResult: PwaCheckInDisplayResult | null;
  showBackButton: boolean;
  camera: ReactNode;
  onModeChange: (mode: CheckInMode) => void;
  onBack: () => void;
  onSwitchCamera: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onResultOk: () => void;
}

const getModeLabel = (mode: CheckInMode) =>
  mode === "CODE_SCAN" ? "Quét mã" : "AI khuôn mặt";

export function PwaCheckInScannerShell({
  mode,
  status,
  statusLabel,
  message,
  lastScannedCode,
  successfulScanCount,
  displayResult,
  showBackButton,
  camera,
  onModeChange,
  onBack,
  onSwitchCamera,
  onCancel,
  onRetry,
  onResultOk,
}: PwaCheckInScannerShellProps) {
  const isSubmitting = status === "submitting";
  const isFaceMode = mode === "FACE_SCAN";
  const showDetailedResult = status === "success" && displayResult;
  const scanStateClass = styles[`mobileScanState_${status}`] ?? "";
  const feedbackStateClass =
    styles[`mobileFeedbackPanel_${status}`] ?? "";

  return (
    <>
      <div
        className={styles.mobileModeSwitch}
        aria-label="Chọn chế độ check-in"
      >
        {(["CODE_SCAN", "FACE_SCAN"] as const).map((nextMode) => (
          <button
            key={nextMode}
            type="button"
            className={`${styles.mobileModeButton} ${
              mode === nextMode ? styles.mobileModeButtonActive : ""
            }`}
            onClick={() => onModeChange(nextMode)}
            aria-pressed={mode === nextMode}
          >
            {getModeLabel(nextMode)}
          </button>
        ))}
      </div>

      <div
        className={`${styles.mobileScanShell} ${styles.mobileScanShellVisible} ai-check-in-mobile-scan`}
        data-testid="pwa-scanner-shell"
        data-mode={mode}
      >
        <div className={styles.mobileScanHeader}>
          {showBackButton && (
            <button
              type="button"
              className={styles.mobileBackButton}
              onClick={onBack}
              aria-label="Trở về màn hình trước đó"
            >
              <ChevronLeft size={18} aria-hidden="true" />
              <span>Trở về</span>
            </button>
          )}

          <div className={styles.mobileBrandBlock}>
            <img
              src={logo}
              alt="Taekwondo Văn Quán"
              className={styles.mobileBrandLogo}
            />
            <div>
              <p className={styles.mobileScanEyebrow}>PWA scanner</p>
              <h1 className={styles.mobileScanTitle}>
                {isFaceMode ? "AI khuôn mặt" : "Quét mã check-in"}
              </h1>
            </div>
          </div>

          <div className={styles.mobileScanHeaderActions}>
            <div
              className={`${styles.mobileScanState} ${scanStateClass}`}
              role="status"
              aria-live="polite"
            >
              {isSubmitting ? (
                <Loader2 size={14} aria-hidden="true" />
              ) : status === "success" ? (
                <CheckCircle2 size={14} aria-hidden="true" />
              ) : isFaceMode ? (
                <ScanFace size={14} aria-hidden="true" />
              ) : (
                <QrCode size={14} aria-hidden="true" />
              )}
              <span>{statusLabel}</span>
            </div>

            <button
              type="button"
              className={styles.mobileCameraSwitchButton}
              onClick={onSwitchCamera}
              disabled={isSubmitting}
            >
              Đổi camera
            </button>
          </div>
        </div>

        <div className={styles.mobileScannerFrame}>
          {camera}
          <div className={styles.mobileScannerMask} aria-hidden="true" />
          <div className={styles.mobileScannerLine} aria-hidden="true" />
        </div>

        <div
          className={`${styles.mobileFeedbackPanel} ${feedbackStateClass}`}
        >
          {showDetailedResult ? (
            <div className={styles.mobileAttendanceDetails}>
              <div className={styles.mobileAttendanceSummary}>
                <span className={styles.mobileAttendanceStatusDot} />
                <div>
                  <p className={styles.mobileFeedbackLabel}>
                    {displayResult.title}
                  </p>
                  {displayResult.name && (
                    <h2 className={styles.mobileAttendanceStudentName}>
                      {displayResult.name}
                    </h2>
                  )}
                </div>
              </div>

              {displayResult.details?.length ? (
                <div className={styles.mobileAttendanceDetailList}>
                  {displayResult.details.map((detail) => (
                    <div key={detail.label}>
                      <span>{detail.label}</span>
                      <strong>{detail.value}</strong>
                    </div>
                  ))}
                  {displayResult.note && (
                    <div className={styles.mobileAttendanceNote}>
                      <span>Ghi chú</span>
                      <strong>{displayResult.note}</strong>
                    </div>
                  )}
                </div>
              ) : null}

              <p className={styles.mobileFeedbackMessage}>{message}</p>

              {successfulScanCount > 0 && (
                <p className={styles.mobileSuccessCount}>
                  Đã check-in {successfulScanCount} người trong phiên này.
                </p>
              )}

              <button
                type="button"
                className={styles.mobileAttendanceOkButton}
                onClick={onResultOk}
              >
                OK
              </button>
            </div>
          ) : (
            <>
              <p className={styles.mobileFeedbackLabel}>{statusLabel}</p>
              <p className={styles.mobileFeedbackMessage}>{message}</p>
              {!isFaceMode && lastScannedCode && (
                <p className={styles.mobileScannedCode}>
                  Mã vừa quét: <span>{lastScannedCode}</span>
                </p>
              )}
              {successfulScanCount > 0 && (
                <p className={styles.mobileSuccessCount}>
                  Đã check-in {successfulScanCount} người trong phiên này.
                </p>
              )}
            </>
          )}
        </div>

        <div className={styles.mobileScanActions}>
          {isSubmitting && (
            <button
              type="button"
              className={styles.mobileCancelButton}
              onClick={onCancel}
            >
              <X size={18} aria-hidden="true" />
              Hủy
            </button>
          )}

          {(status === "error" || status === "canceled") && (
            <button
              type="button"
              className={styles.mobilePrimaryButton}
              onClick={onRetry}
            >
              <RotateCcw size={18} aria-hidden="true" />
              Quét tiếp
            </button>
          )}
        </div>
      </div>
    </>
  );
}
