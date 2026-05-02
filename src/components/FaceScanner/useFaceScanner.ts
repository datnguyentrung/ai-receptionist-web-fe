import type { Detection } from "@mediapipe/tasks-vision";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CheckInResponse } from "../../types";
import { submitFaceCheckIn } from "./faceScannerCheckIn";
import { createFaceDetector } from "./faceScannerDetector";

interface UseFaceScannerParams {
  checkInResult?: CheckInResponse | null;
  onCheckInResult?: (result: CheckInResponse | null) => void;
}

export const useFaceScanner = ({
  checkInResult,
  onCheckInResult,
}: UseFaceScannerParams) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceDetector, setFaceDetector] = useState<Awaited<
    ReturnType<typeof createFaceDetector>
  > | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastVideoTimeRef = useRef(-1);
  const requestRef = useRef<number>(0);
  const isScanningRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasStartedRef = useRef(false);
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

  const cancelPendingCheckIn = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isSubmittingRef.current = false;
    setIsSubmitting(false);
    if (!checkInResult) {
      resumeScanning();
    }
  }, [checkInResult, resumeScanning]);

  const captureAndSend = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    if (isSubmittingRef.current) return;

    setIsScanning(false);
    isScanningRef.current = false;
    setIsSubmitting(true);
    isSubmittingRef.current = true;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (requestRef.current) window.cancelAnimationFrame(requestRef.current);

    const context = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context?.drawImage(videoRef.current, 0, 0);

    canvasRef.current.toBlob(async (blob) => {
      if (!blob) {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        if (!checkInResult) {
          resumeScanning();
        }
        return;
      }

      const formData = new FormData();
      formData.append("file", blob, "face.jpg");
      const controller = new AbortController();
      abortControllerRef.current = controller;

      await submitFaceCheckIn({
        formData,
        signal: controller.signal,
        checkInResult,
        onCheckInResult,
        resumeScanning,
        stopScanningDuringCheckIn,
        setSubmitting: setIsSubmitting,
      });

      abortControllerRef.current = null;
      isSubmittingRef.current = false;
    }, "image/jpeg");
  }, [
    checkInResult,
    onCheckInResult,
    resumeScanning,
    stopScanningDuringCheckIn,
  ]);

  const processDetections = useCallback(
    (detections: Detection[]) => {
      if (detections.length === 0) return;

      resetInactivityTimeout();
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
    },
    [captureAndSend, resetInactivityTimeout],
  );

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

  useEffect(() => {
    predictWebcamRef.current = predictWebcam;
  }, [predictWebcam]);

  const startVideo = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (!videoRef.current) return;

    videoRef.current.srcObject = stream;
    videoRef.current.addEventListener(
      "loadeddata",
      () => predictWebcamRef.current(),
      { once: true },
    );
    setHasStarted(true);
    hasStartedRef.current = true;
    setIsScanning(true);
    isScanningRef.current = true;
    resetInactivityTimeout();
  }, [resetInactivityTimeout]);

  useEffect(() => {
    const initDetector = async () => {
      const detector = await createFaceDetector();
      setFaceDetector(detector);
    };

    initDetector();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (checkInResult || isSubmitting) {
      isScanningRef.current = false;
      if (requestRef.current) window.cancelAnimationFrame(requestRef.current);
      return;
    }

    const id = setTimeout(() => resumeScanning(), 3000);
    return () => clearTimeout(id);
  }, [checkInResult, isSubmitting, resumeScanning]);

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

  return {
    videoRef,
    canvasRef,
    faceDetector,
    isScanning,
    hasStarted,
    isSubmitting,
    startVideo,
    stopScanningDueToInactivity,
    cancelPendingCheckIn,
  };
};
