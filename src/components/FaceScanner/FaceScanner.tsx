import React from "react";
import { FaceScannerView } from "./FaceScannerView";
import { useFaceScanner } from "./useFaceScanner";
import type { CheckInResponse } from '../../types';

interface FaceScannerProps {
  checkInResult?: CheckInResponse | null;
  onCheckInResult?: (result: CheckInResponse | null) => void;
}

export const FaceScanner: React.FC<FaceScannerProps> = ({
  checkInResult,
  onCheckInResult,
}) => {
  const scanner = useFaceScanner({ checkInResult, onCheckInResult });

  return <FaceScannerView {...scanner} />;
};

export default FaceScanner;
