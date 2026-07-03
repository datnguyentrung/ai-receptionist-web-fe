export type ScannedCheckInCodeFormat = "qr" | "barcode" | "unknown";

export interface ScannedCheckInCodeInput {
  rawValue: string;
  format?: ScannedCheckInCodeFormat;
}

export interface ScannedCheckInCodeValidationResult {
  isValid: boolean;
  normalizedCode: string;
  format: ScannedCheckInCodeFormat;
  errorMessage?: string;
}

export function validateScannedCheckInCode({
  rawValue,
  format = "unknown",
}: ScannedCheckInCodeInput): ScannedCheckInCodeValidationResult {
  const normalizedCode = rawValue.trim();

  if (!normalizedCode) {
    return {
      isValid: false,
      normalizedCode,
      format,
      errorMessage: "Mã quét trống. Vui lòng thử lại.",
    };
  }

  return {
    isValid: true,
    normalizedCode,
    format,
  };
}
