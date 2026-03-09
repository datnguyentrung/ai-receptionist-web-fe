import type { Detection } from "@mediapipe/tasks-vision";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import React, { useEffect, useRef, useState } from "react";
import styles from "./FaceScanner.module.scss";

export interface CheckInResult {
  full_name: string;
  belt_level?: string;
  photo_url?: string;
  upcoming_class?: {
    time: string;
    location: string;
  };
}

interface FaceScannerProps {
  onCheckInResult?: (result: CheckInResult) => void;
}

const FaceScanner: React.FC<FaceScannerProps> = ({ onCheckInResult }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
  const [isScanning, setIsScanning] = useState(false);

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
  }, []);

  // 2. Open Webcam
  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener("loadeddata", predictWebcam);
      setIsScanning(true);
    }
  };

  // 3. Detection loop (Realtime)
  let lastVideoTime = -1;
  const predictWebcam = async () => {
    if (!videoRef.current || !faceDetector) return;

    const startTimeMs = performance.now();
    if (videoRef.current.currentTime !== lastVideoTime) {
      lastVideoTime = videoRef.current.currentTime;
      const { detections } = faceDetector.detectForVideo(
        videoRef.current,
        startTimeMs,
      );
      processDetections(detections);
    }

    if (isScanning) {
      window.requestAnimationFrame(predictWebcam);
    }
  };

  // 4. Business logic: capture & send when face is close enough
  const processDetections = (detections: Detection[]) => {
    if (detections.length > 0) {
      const face = detections[0];
      const box = face.boundingBox;
      if (!box) return;

      const faceSize = box.width * box.height;
      const videoSize =
        videoRef.current!.videoWidth * videoRef.current!.videoHeight;
      const sizeRatio = faceSize / videoSize;

      if (sizeRatio > 0.15 && face.categories[0].score > 0.8) {
        captureAndSend();
      }
    }
  };

  const captureAndSend = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Debounce: pause scanning while API call is in flight
    setIsScanning(false);

    const context = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context?.drawImage(videoRef.current, 0, 0);

    canvasRef.current.toBlob(async (blob) => {
      if (blob) {
        const formData = new FormData();
        formData.append("file", blob, "face.jpg");

        try {
          const response = await fetch(
            "http://localhost:8000/api/v1/attendance/check-in",
            {
              method: "POST",
              body: formData,
            },
          );
          const result: CheckInResult = await response.json();
          onCheckInResult?.(result);
        } catch (error) {
          console.error("Error sending image:", error);
        } finally {
          // Resume scanning after 3 seconds
          setTimeout(() => setIsScanning(true), 3000);
        }
      }
    }, "image/jpeg");
  };

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
        {isScanning && (
          <div className={styles.statusBadge}>
            <span className={styles.statusDot} />
            <span className={styles.statusText}>Scanning Face</span>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className={styles.hidden} />

      {!isScanning && (
        <button className={styles.startButton} onClick={startVideo}>
          Start AI Receptionist
        </button>
      )}

      {!faceDetector && <p className={styles.loadingText}>Loading AI model…</p>}
    </div>
  );
};

export default FaceScanner;
