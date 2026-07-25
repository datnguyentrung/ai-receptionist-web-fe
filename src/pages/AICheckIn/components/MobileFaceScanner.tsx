import { forwardRef, useEffect, useImperativeHandle } from "react";
import type { CheckInResponse } from "@/types";
import { useFaceScanner } from "@/features/checkIn/components/FaceScanner/useFaceScanner";

export interface MobileFaceScannerHandle {
  switchCamera: () => void;
  retry: () => void;
  cancelPendingCheckIn: () => void;
}

export interface MobileFaceScannerState {
  status:
    | "loading-model"
    | "requesting-camera"
    | "scanning"
    | "submitting"
    | "error";
  errorMessage: string | null;
  facingMode: "user" | "environment";
  isSubmitting: boolean;
}

interface MobileFaceScannerProps {
  checkInResult: CheckInResponse | null;
  onCheckInResult: (result: CheckInResponse | null) => void;
  onStateChange: (state: MobileFaceScannerState) => void;
  videoClassName: string;
  mirroredClassName: string;
}

export const MobileFaceScanner = forwardRef<
  MobileFaceScannerHandle,
  MobileFaceScannerProps
>(function MobileFaceScanner(
  {
    checkInResult,
    onCheckInResult,
    onStateChange,
    videoClassName,
    mirroredClassName,
  },
  ref,
) {
  const scanner = useFaceScanner({
    checkInResult,
    onCheckInResult,
    resumeAfterCancel: false,
  });

  useImperativeHandle(
    ref,
    () => ({
      switchCamera: scanner.switchCamera,
      retry: scanner.retry,
      cancelPendingCheckIn: scanner.cancelPendingCheckIn,
    }),
    [
      scanner.cancelPendingCheckIn,
      scanner.retry,
      scanner.switchCamera,
    ],
  );

  useEffect(() => {
    onStateChange({
      status: scanner.status,
      errorMessage: scanner.errorMessage,
      facingMode: scanner.facingMode,
      isSubmitting: scanner.isSubmitting,
    });
  }, [
    onStateChange,
    scanner.errorMessage,
    scanner.facingMode,
    scanner.isSubmitting,
    scanner.status,
  ]);

  return (
    <div
      className={`${videoClassName} ${
        scanner.facingMode === "user" ? mirroredClassName : ""
      }`}
    >
      <video
        ref={scanner.videoRef}
        autoPlay
        muted
        playsInline
        data-testid="face-camera"
      />
      <canvas ref={scanner.canvasRef} hidden />
    </div>
  );
});

export default MobileFaceScanner;
