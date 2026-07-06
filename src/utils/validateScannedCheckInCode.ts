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

function isValidDateCode(dateCode: string): boolean {
  if (!/^\d{6}$/.test(dateCode)) {
    return false;
  }

  const day = Number(dateCode.slice(0, 2));
  const month = Number(dateCode.slice(2, 4));
  const year = Number(dateCode.slice(4, 6));

  // Quy ước yy:
  // 00-29 => 2000-2029
  // 30-99 => 1930-1999
  const fullYear = year <= 29 ? 2000 + year : 1900 + year;

  const date = new Date(fullYear, month - 1, day);

  return (
    date.getFullYear() === fullYear &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function validateScannedCheckInCode({
  rawValue,
  format = "unknown",
}: ScannedCheckInCodeInput): ScannedCheckInCodeValidationResult {
  const rawCode = rawValue.trim();

  if (!rawCode) {
    return {
      isValid: false,
      normalizedCode: "",
      format,
      errorMessage: "Mã quét trống. Vui lòng thử lại.",
    };
  }

  if (
    rawCode === "/" ||
    rawCode.startsWith("/") ||
    /^https?:\/\//i.test(rawCode) ||
    /^www\./i.test(rawCode)
  ) {
    return {
      isValid: false,
      normalizedCode: rawCode,
      format,
      errorMessage:
        "Mã quét không hợp lệ. Vui lòng quét mã học viên, không quét đường dẫn.",
    };
  }

  const parts = rawCode.split("_");

  if (parts.length !== 3) {
    return {
      isValid: false,
      normalizedCode: rawCode,
      format,
      errorMessage:
        "Mã quét không đúng định dạng. Ví dụ hợp lệ: VQ_nguyennk_290709.",
    };
  }

  const [prefix, studentCode, dateCode] = parts;

  if (prefix !== "VQ") {
    return {
      isValid: false,
      normalizedCode: rawCode,
      format,
      errorMessage: "Mã quét không hợp lệ. Mã phải bắt đầu bằng VQ.",
    };
  }

  const normalizedStudentCode = studentCode.trim();

  if (!normalizedStudentCode) {
    return {
      isValid: false,
      normalizedCode: rawCode,
      format,
      errorMessage: "Mã học viên trong mã quét đang trống.",
    };
  }

  if (!/^\d{6}$/.test(dateCode)) {
    return {
      isValid: false,
      normalizedCode: rawCode,
      format,
      errorMessage:
        "Ngày sinh trong mã quét phải gồm đúng 6 chữ số theo định dạng ddMMyy.",
    };
  }

  if (!isValidDateCode(dateCode)) {
    return {
      isValid: false,
      normalizedCode: rawCode,
      format,
      errorMessage: "Ngày sinh trong mã quét không hợp lệ.",
    };
  }

  return {
    isValid: true,
    normalizedCode: rawCode,
    format,
  };
}
