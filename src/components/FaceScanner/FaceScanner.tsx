import { userAPI } from "@/features/user/api/userAPI";
import type { Detection } from "@mediapipe/tasks-vision";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { AttendanceRecord } from "../../types";
import { playSound } from "../../utils/playSound";
// import { speakText } from "../../utils/speakText";
import styles from "./FaceScanner.module.scss";

interface FaceScannerProps {
  checkInResult?: AttendanceRecord | null;
  onCheckInResult?: (result: AttendanceRecord | null) => void;
}

export const FaceScanner: React.FC<FaceScannerProps> = ({
  checkInResult,
  onCheckInResult,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const lastVideoTimeRef = useRef(-1);
  const requestRef = useRef<number>(0);
  const isScanningRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasStartedRef = useRef(false);
  // Ref để phá circular dependency: resumeScanning → predictWebcam → ... → resumeScanning
  const predictWebcamRef = useRef<() => Promise<void>>(async () => {});

  const stopScanningDueToInactivity = useCallback((logs: string) => {
    console.log(logs);

    setIsScanning(false);
    isScanningRef.current = false;
    setHasStarted(false);
    hasStartedRef.current = false;
    if (requestRef.current) {
      window.cancelAnimationFrame(requestRef.current);
    }
  }, []);

  const stopScanningDuringCheckIn = useCallback(() => {
    setIsScanning(false);
    isScanningRef.current = false;
    if (requestRef.current) {
      window.cancelAnimationFrame(requestRef.current);
    }
  }, []);

  const resetInactivityTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(
      () =>
        stopScanningDueToInactivity(
          "No face detected for 10 seconds. Stopping scanner to save resources.",
        ),
      10000,
    );
  }, [stopScanningDueToInactivity]);

  // Gọi predictWebcamRef.current để tránh circular dependency với predictWebcam
  const resumeScanning = useCallback(() => {
    if (hasStartedRef.current) {
      setIsScanning(true);
      isScanningRef.current = true;
      resetInactivityTimeout();
      if (faceDetector && videoRef.current) {
        if (requestRef.current) window.cancelAnimationFrame(requestRef.current);
        requestRef.current = window.requestAnimationFrame(() =>
          predictWebcamRef.current(),
        );
      }
    }
  }, [faceDetector, resetInactivityTimeout]);

  // 1. Initialize Face Detector
  useEffect(() => {
    const initDetector = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
      );
      const detector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/models/blaze_face_short_range.tflite",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
      });
      setFaceDetector(detector);
    };
    initDetector();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current); // Cleanup timeout khi component unmount
    };
  }, []);

  // 4. Business logic: capture & send when face is close enough
  const captureAndSend = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(false);
    isScanningRef.current = false;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (requestRef.current) window.cancelAnimationFrame(requestRef.current);

    const context = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context?.drawImage(videoRef.current, 0, 0);

    canvasRef.current.toBlob(async (blob) => {
      if (blob) {
        const formData = new FormData();
        formData.append("file", blob, "face.jpg");

        try {
          console.log("Sending to server...");
          const response: AttendanceRecord =
            await userAPI.face_check_in(formData);
          stopScanningDuringCheckIn();
          playSound("success");
          // speakText("Check-in thành công!");
          onCheckInResult?.(response);
        } catch (error) {
          console.error("Error sending image:", error);
          playSound("error");
          setTimeout(() => {
            if (!checkInResult) resumeScanning();
          }, 5000);
        }
      }
    }, "image/jpeg");
  }, [
    checkInResult,
    onCheckInResult,
    resumeScanning,
    stopScanningDuringCheckIn,
  ]);

  const processDetections = useCallback(
    (detections: Detection[]) => {
      if (detections.length > 0) {
        resetInactivityTimeout();
        const face = detections[0];
        const box = face.boundingBox;
        if (!box) return;
        const faceSize = box.width * box.height;
        const videoSize =
          videoRef.current!.videoWidth * videoRef.current!.videoHeight;
        const sizeRatio = faceSize / videoSize;
        if (sizeRatio > 0.15 && face.categories[0].score > 0.8)
          captureAndSend();
      }
    },
    [captureAndSend, resetInactivityTimeout],
  );

  // 3. Detection loop — useCallback fixes React Compiler warning about impure performance.now()
  const predictWebcam = useCallback(async () => {
    if (!videoRef.current || !faceDetector || !isScanningRef.current) return;

    if (
      videoRef.current.videoHeight === 0 ||
      videoRef.current.videoWidth === 0
    ) {
      window.requestAnimationFrame(() => predictWebcamRef.current());
      return;
    }

    const startTimeMs = performance.now();

    if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = videoRef.current.currentTime;
      const { detections } = faceDetector.detectForVideo(
        videoRef.current,
        startTimeMs,
      );
      processDetections(detections);
    }

    if (isScanningRef.current) {
      requestRef.current = window.requestAnimationFrame(() =>
        predictWebcamRef.current(),
      );
    }
  }, [faceDetector, processDetections]);

  // Giữ predictWebcamRef luôn trỏ đến phiên bản mới nhất của predictWebcam
  useEffect(() => {
    predictWebcamRef.current = predictWebcam;
  }, [predictWebcam]);

  // 2. Open Webcam
  const startVideo = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener("loadeddata", () =>
        predictWebcamRef.current(),
      );
      setHasStarted(true);
      hasStartedRef.current = true;
      setIsScanning(true);
      isScanningRef.current = true;
      resetInactivityTimeout();
    }
  }, [resetInactivityTimeout]);

  useEffect(() => {
    if (checkInResult) {
      // isScanning is already false from captureAndSend; just cancel any pending frame
      isScanningRef.current = false;
      if (requestRef.current) window.cancelAnimationFrame(requestRef.current);
    } else {
      // Defer to avoid synchronous setState inside an effect (React Compiler)
      // Sau 3 giây mới tiếp tục quét để tránh gửi nhiều request liên tiếp nếu người dùng đứng yên trước camera
      const id = setTimeout(() => resumeScanning(), 3000);
      return () => clearTimeout(id);
    }
  }, [checkInResult, resumeScanning]);

  useEffect(() => {
    if (isScanning && faceDetector) {
      requestRef.current = window.requestAnimationFrame(() =>
        predictWebcamRef.current(),
      );
    }
    return () => {
      if (requestRef.current) window.cancelAnimationFrame(requestRef.current);
    };
  }, [isScanning, faceDetector]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.videoContainer}>
        <video ref={videoRef} autoPlay playsInline className={styles.video} />

        {/* Vignette overlay */}
        <div className={styles.overlay} />

        {/* Corner bracket markers */}
        <div className={`${styles.cornerBracket} ${styles.cornerTL}`} />
        <div className={`${styles.cornerBracket} ${styles.cornerTR}`} />
        <div className={`${styles.cornerBracket} ${styles.cornerBL}`} />
        <div className={`${styles.cornerBracket} ${styles.cornerBR}`} />

        {/* Animated scan line */}
        {isScanning && <div className={styles.scanLine} />}

        {/* Status badge */}
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
      {/* Nút để tạm dừng quét nếu cần (ví dụ khi có check-in result hiện lên) */}
      {hasStarted && (
        <button
          className={styles.stopButton}
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
    </div>
  );
};

export default FaceScanner;
