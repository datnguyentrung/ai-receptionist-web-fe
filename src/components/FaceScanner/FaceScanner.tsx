import { userAPI } from "@/features/user/api/userAPI";
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

export const FaceScanner: React.FC<FaceScannerProps> = ({
  onCheckInResult,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const lastVideoTimeRef = useRef(-1);
  const requestRef = useRef<number>(0);
  const isScanningRef = useRef(false); // Thêm dòng này để track trạng thái trong vòng lặp

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

      setHasStarted(true);
      setIsScanning(true);
      isScanningRef.current = true; // Cập nhật trạng thái trong ref khi bắt đầu scanning
    }
  };

  // 3. Detection loop (Realtime)
  const predictWebcam = async () => {
    // Kiểm tra video element và faceDetector đã sẵn sàng chưa
    if (!videoRef.current || !faceDetector || !isScanningRef.current) return;

    if (
      videoRef.current.videoHeight === 0 ||
      videoRef.current.videoWidth === 0
    ) {
      // Nếu video chưa sẵn sàng (chưa có khung hình), tiếp tục yêu cầu frame tiếp theo
      window.requestAnimationFrame(predictWebcam);
      return;
    }

    // Chỉ chạy detect khi video đã cập nhật khung hình mới (dựa vào currentTime)
    const startTimeMs = performance.now();

    // Nếu currentTime của video đã thay đổi so với lần detect trước, nghĩa là có khung hình mới -> chạy detect
    if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = videoRef.current.currentTime;
      // Chạy detect trên khung hình hiện tại của video
      const { detections } = faceDetector.detectForVideo(
        videoRef.current,
        startTimeMs,
      );
      // Xử lý kết quả detect (nếu có)
      processDetections(detections);
    }

    // 2. Chỉ gọi frame tiếp theo nếu CHẮC CHẮN vẫn đang scan
    if (isScanningRef.current) {
      requestRef.current = window.requestAnimationFrame(predictWebcam);
    }
  };

  useEffect(() => {
    if (isScanning && faceDetector) {
      requestRef.current = window.requestAnimationFrame(predictWebcam);
    }

    // Cleanup function: Tự động hủy vòng lặp cũ khi isScanning chuyển false
    // hoặc khi component bị tháo khỏi DOM
    return () => {
      if (requestRef.current) {
        window.cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isScanning, faceDetector]);

  // 4. Business logic: capture & send when face is close enough
  const processDetections = (detections: Detection[]) => {
    // Nếu phát hiện ít nhất 1 khuôn mặt, lấy khuôn mặt đầu tiên để phân tích
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
    setIsScanning(false); // Dừng vòng lặp
    isScanningRef.current = false; // Cập nhật trạng thái trong ref

    // Hủy luôn frame đang chờ (nếu có)
    if (requestRef.current) {
      window.cancelAnimationFrame(requestRef.current);
    }

    const context = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context?.drawImage(videoRef.current, 0, 0);

    // Chuyển canvas sang Blob để gửi lên server
    canvasRef.current.toBlob(async (blob) => {
      if (blob) {
        const formData = new FormData();
        formData.append("file", blob, "face.jpg");

        // KIỂM TRA DỮ LIỆU TẠI ĐÂY
        // console.log("FormData actual content:", Array.from(formData.entries()));

        try {
          console.log("Sending to server...");
          const response = await userAPI.face_check_in(formData);
          // onCheckInResult?.(result);
          console.log("Check-in result:", response);
        } catch (error) {
          console.error("Error sending image:", error);
        } finally {
          // Resume scanning after 3 seconds
          setTimeout(() => {
            setIsScanning(true);
            isScanningRef.current = true; // Nhớ bật lại cả Ref
            // Hàm useEffect bên dưới sẽ tự động gọi lại predictWebcam()
          }, 3000);
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

      {!faceDetector && <p className={styles.loadingText}>Loading AI model…</p>}
    </div>
  );
};

export default FaceScanner;
