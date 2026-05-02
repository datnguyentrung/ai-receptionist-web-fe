import type { FaceDetector } from "@mediapipe/tasks-vision";
import type React from "react";
import styles from "./FaceScannerView.module.scss";

interface FaceScannerViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  faceDetector: FaceDetector | null;
  isScanning: boolean;
  hasStarted: boolean;
  isSubmitting: boolean;
  startVideo: () => void;
  stopScanningDueToInactivity: (logs: string) => void;
  cancelPendingCheckIn: () => void;
}

export const FaceScannerView = ({
  videoRef,
  canvasRef,
  faceDetector,
  isScanning,
  hasStarted,
  isSubmitting,
  startVideo,
  stopScanningDueToInactivity,
  cancelPendingCheckIn,
}: FaceScannerViewProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.videoContainer}>
        <video ref={videoRef} autoPlay playsInline className={styles.video} />

        <div className={styles.overlay} />

        <div className={`${styles.cornerBracket} ${styles.cornerTL}`} />
        <div className={`${styles.cornerBracket} ${styles.cornerTR}`} />
        <div className={`${styles.cornerBracket} ${styles.cornerBL}`} />
        <div className={`${styles.cornerBracket} ${styles.cornerBR}`} />

        {isScanning && <div className={styles.scanLine} />}

        {hasStarted && (
          <div className={styles.statusBadge}>
            <span className={styles.statusDot} />
            <span className={styles.statusText}>Scanning Face</span>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className={styles.hidden} />

      {!hasStarted && (
        <button className={styles.startButton} onClick={startVideo}>
          Start AI Receptionist
        </button>
      )}

      {hasStarted && (
        <button
          className={styles.stopButton}
          disabled={isSubmitting}
          onClick={() =>
            stopScanningDueToInactivity(
              "No longer scanning due to user action.",
            )
          }
        >
          Stop Scanning
        </button>
      )}

      {!faceDetector && <p className={styles.loadingText}>Loading AI model…</p>}

      {isSubmitting && (
        <div className={styles.pendingOverlay}>
          <div className={styles.pendingCard}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={cancelPendingCheckIn}
              aria-label="Cancel check-in request"
            >
              X
            </button>
            <div className={styles.spinner} aria-hidden="true" />
            <p className={styles.pendingTitle}>Checking in...</p>
            <p className={styles.pendingSubtitle}>
              Please keep your face in frame.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
