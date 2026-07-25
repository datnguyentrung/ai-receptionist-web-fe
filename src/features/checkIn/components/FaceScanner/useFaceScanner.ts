import type { Detection } from "@mediapipe/tasks-vision";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CheckInResponse } from "@/types";
import { submitFaceCheckIn } from "./faceScannerCheckIn";
import { createFaceDetector } from "./faceScannerDetector";

type CameraFacingMode = "user" | "environment";
type FaceScannerStatus =
  | "loading-model"
  | "requesting-camera"
  | "scanning"
  | "submitting"
  | "error";

interface UseFaceScannerParams {
  checkInResult?: CheckInResponse | null;
  onCheckInResult?: (result: CheckInResponse | null) => void;
  resumeAfterCancel?: boolean;
}

const CAMERA_ERROR_MESSAGE =
  "Không thể mở camera. Kiểm tra quyền camera rồi thử lại.";

export const useFaceScanner = ({
  checkInResult,
  onCheckInResult,
  resumeAfterCancel = true,
}: UseFaceScannerParams) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<Awaited<ReturnType<typeof createFaceDetector>> | null>(null);
  const requestRef = useRef<number>(0);
  const cameraRequestRef = useRef(0);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isScanningRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const hasStartedRef = useRef(false);
  const lastVideoTimeRef = useRef(-1);
  const autoStartAttemptedRef = useRef(false);
  const predictWebcamRef = useRef<() => Promise<void>>(async () => {});

  const [faceDetector, setFaceDetector] = useState<Awaited<
    ReturnType<typeof createFaceDetector>
  > | null>(null);
  const [status, setStatus] = useState<FaceScannerStatus>("loading-model");
  const [hasStarted, setHasStarted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>("user");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDetector = useCallback(async () => {
    setStatus("loading-model");
    setErrorMessage(null);

    try {
      const detector = await createFaceDetector();
      if (!isMountedRef.current) {
        detector.close();
        return null;
      }
      detectorRef.current?.close();
      detectorRef.current = detector;
      setFaceDetector(detector);
      return detector;
    } catch (error) {
      if (!isMountedRef.current) return null;
      console.warn("Face detector could not load:", error);
      setErrorMessage("Không thể tải mô hình nhận diện. Vui lòng thử lại.");
      setStatus("error");
      return null;
    }
  }, []);

  const stopAnimationFrame = useCallback(() => {
    if (requestRef.current) {
      window.cancelAnimationFrame(requestRef.current);
      requestRef.current = 0;
    }
  }, []);

  const stopStream = useCallback(() => {
    stopAnimationFrame();
    isScanningRef.current = false;
    if (isMountedRef.current) {
      setIsScanning(false);
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stopAnimationFrame]);

  const resumeScanning = useCallback(() => {
    if (
      !isMountedRef.current ||
      !hasStartedRef.current ||
      !faceDetector ||
      !videoRef.current
    ) {
      return;
    }

    isScanningRef.current = true;
    setIsScanning(true);
    setStatus("scanning");
    stopAnimationFrame();
    requestRef.current = window.requestAnimationFrame(() =>
      predictWebcamRef.current(),
    );
  }, [faceDetector, stopAnimationFrame]);

  const stopScanningDuringCheckIn = useCallback(() => {
    stopAnimationFrame();
    isScanningRef.current = false;
    if (isMountedRef.current) {
      setIsScanning(false);
    }
  }, [stopAnimationFrame]);

  const setSubmittingState = useCallback((nextValue: boolean) => {
    isSubmittingRef.current = nextValue;
    if (isMountedRef.current) {
      setIsSubmitting(nextValue);
    }
  }, []);

  const emitCheckInResult = useCallback(
    (result: CheckInResponse | null) => {
      if (isMountedRef.current) {
        onCheckInResult?.(result);
      }
    },
    [onCheckInResult],
  );

  const handleRequestError = useCallback(
    (message: string) => {
      if (!isMountedRef.current) return;
      stopScanningDuringCheckIn();
      setSubmittingState(false);
      setErrorMessage(message);
      setStatus("error");
    },
    [setSubmittingState, stopScanningDuringCheckIn],
  );

  const captureAndSend = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || isSubmittingRef.current) return;

    stopScanningDuringCheckIn();
    setSubmittingState(true);
    setStatus("submitting");

    const context = canvas.getContext("2d");
    if (!context || video.videoWidth === 0 || video.videoHeight === 0) {
      handleRequestError("Không thể chụp ảnh từ camera. Vui lòng thử lại.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!isMountedRef.current) return;
      if (!blob) {
        handleRequestError("Không thể tạo ảnh nhận diện. Vui lòng thử lại.");
        return;
      }

      const formData = new FormData();
      formData.append("file", blob, "face.jpg");
      const controller = new AbortController();
      abortControllerRef.current = controller;

      await submitFaceCheckIn({
        formData,
        signal: controller.signal,
        onCheckInResult: emitCheckInResult,
        stopScanningDuringCheckIn,
        setSubmitting: setSubmittingState,
        onRequestError: handleRequestError,
      });

      if (!isMountedRef.current) return;
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      isSubmittingRef.current = false;
    }, "image/jpeg");
  }, [
    handleRequestError,
    emitCheckInResult,
    setSubmittingState,
    stopScanningDuringCheckIn,
  ]);

  const processDetections = useCallback(
    (detections: Detection[]) => {
      const face = detections[0];
      const box = face?.boundingBox;
      const video = videoRef.current;
      if (!box || !video) return;

      const videoSize = video.videoWidth * video.videoHeight;
      const confidence = face.categories[0]?.score ?? 0;
      const sizeRatio = videoSize > 0 ? (box.width * box.height) / videoSize : 0;

      if (sizeRatio > 0.15 && confidence > 0.8) {
        captureAndSend();
      }
    },
    [captureAndSend],
  );

  const predictWebcam = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !faceDetector || !isScanningRef.current) return;

    if (video.videoHeight === 0 || video.videoWidth === 0) {
      requestRef.current = window.requestAnimationFrame(() =>
        predictWebcamRef.current(),
      );
      return;
    }

    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      const { detections } = faceDetector.detectForVideo(video, performance.now());
      processDetections(detections);
    }

    if (isScanningRef.current) {
      requestRef.current = window.requestAnimationFrame(() =>
        predictWebcamRef.current(),
      );
    }
  }, [faceDetector, processDetections]);

  useEffect(() => {
    predictWebcamRef.current = predictWebcam;
  }, [predictWebcam]);

  const startVideo = useCallback(
    async (requestedFacingMode: CameraFacingMode = facingMode) => {
      if (!faceDetector || isSubmittingRef.current) return;

      const cameraRequestId = cameraRequestRef.current + 1;
      cameraRequestRef.current = cameraRequestId;
      stopStream();
      setErrorMessage(null);
      setStatus("requesting-camera");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: requestedFacingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        const video = videoRef.current;
        if (!video || !isMountedRef.current || cameraRequestId !== cameraRequestRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();
        setFacingMode(requestedFacingMode);
        setHasStarted(true);
        hasStartedRef.current = true;
        lastVideoTimeRef.current = -1;
        resumeScanning();
      } catch (error) {
        stopStream();
        if (!isMountedRef.current) return;
        console.warn("Face camera could not start:", error);
        hasStartedRef.current = false;
        setHasStarted(false);
        setErrorMessage(CAMERA_ERROR_MESSAGE);
        setStatus("error");
      }
    },
    [faceDetector, facingMode, resumeScanning, stopStream],
  );

  const retry = useCallback(() => {
    if (!faceDetector) {
      autoStartAttemptedRef.current = false;
      void loadDetector();
      return;
    }

    void startVideo();
  }, [faceDetector, loadDetector, startVideo]);

  const switchCamera = useCallback(() => {
    const nextFacingMode = facingMode === "user" ? "environment" : "user";
    void startVideo(nextFacingMode);
  }, [facingMode, startVideo]);

  const cancelPendingCheckIn = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setSubmittingState(false);
    stopScanningDuringCheckIn();
    if (resumeAfterCancel && !checkInResult) {
      resumeScanning();
    }
  }, [
    checkInResult,
    resumeAfterCancel,
    resumeScanning,
    setSubmittingState,
    stopScanningDuringCheckIn,
  ]);

  useEffect(() => {
    isMountedRef.current = true;
    const initializeDetector = async () => {
      await loadDetector();
    };

    void initializeDetector();

    return () => {
      isMountedRef.current = false;
      cameraRequestRef.current += 1;
      abortControllerRef.current?.abort();
      stopStream();
      detectorRef.current?.close();
      detectorRef.current = null;
    };
  }, [loadDetector, stopStream]);

  useEffect(() => {
    if (!faceDetector || autoStartAttemptedRef.current || checkInResult) return;
    autoStartAttemptedRef.current = true;
    void startVideo();
  }, [checkInResult, faceDetector, startVideo]);

  useEffect(() => {
    if (!checkInResult && !isSubmitting && hasStartedRef.current) {
      resumeScanning();
    }
  }, [checkInResult, isSubmitting, resumeScanning]);

  return {
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
  };
};
