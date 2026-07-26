import { forwardRef, useImperativeHandle } from "react";
import type { CheckInResponse } from "@/types";
import {
  type FaceScannerState,
  useFaceScanner,
} from "@/features/checkIn/components/FaceScanner/useFaceScanner";

export interface MobileFaceScannerHandle {
  switchCamera: () => void;
  retry: () => void;
  cancelPendingCheckIn: () => void;
}

export type MobileFaceScannerState = FaceScannerState;

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
    onStateChange,
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
