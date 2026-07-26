import React from "react";
import { FaceScannerView } from "./FaceScannerView";
import { type FaceScannerState, useFaceScanner } from "./useFaceScanner";
import type { CheckInResponse } from "@/types";

interface FaceScannerProps {
  checkInResult?: CheckInResponse | null;
  onCheckInResult?: (result: CheckInResponse | null) => void;
  onStateChange?: (state: FaceScannerState) => void;
  onBack?: () => void;
}

export const FaceScanner: React.FC<FaceScannerProps> = ({
  checkInResult,
  onCheckInResult,
  onStateChange,
  onBack,
}) => {
  const scanner = useFaceScanner({
    checkInResult,
    onCheckInResult,
    onStateChange,
  });

  return <FaceScannerView {...scanner} onBack={onBack} />;
};

export default FaceScanner;
