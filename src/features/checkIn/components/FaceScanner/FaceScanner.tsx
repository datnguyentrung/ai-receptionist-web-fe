import React from "react";
import { FaceScannerView } from "./FaceScannerView";
import { useFaceScanner } from "./useFaceScanner";
import type { CheckInResponse } from "@/types";

interface FaceScannerProps {
  checkInResult?: CheckInResponse | null;
  onCheckInResult?: (result: CheckInResponse | null) => void;
  onBack?: () => void;
}

export const FaceScanner: React.FC<FaceScannerProps> = ({
  checkInResult,
  onCheckInResult,
  onBack,
}) => {
  const scanner = useFaceScanner({ checkInResult, onCheckInResult });

  return <FaceScannerView {...scanner} onBack={onBack} />;
};

export default FaceScanner;
