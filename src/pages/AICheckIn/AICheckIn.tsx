import { APP_MODE } from "@/config/appMode";
import { AttendanceStatusLabel, BeltLabel, CoachStatusLabel, StudentStatusLabel } from "@/config/constants";
import { playSound } from "@/features/checkIn/utils/playSound";
import {
  ScannedCheckInCodeError,
  submitScannedCheckInCode,
} from "@/features/checkIn/utils/submitScannedCheckInCode";
import {
  type ScannedCheckInCodeFormat,
} from "@/features/checkIn/utils/validateScannedCheckInCode";
import type {
  CheckInResponse,
  CoachTimesheetResponse,
  StudentAttendanceResponse,
} from "@/types";
import { writeDebugStorage } from "@/utils/debugStorage";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import axios from "axios";
import type { BarcodeFormat } from "barcode-detector";
import {
  CheckCircle2,
  ChevronLeft,
  Loader2,
  QrCode,
  RotateCcw,
  ShieldAlert,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AICheckIn.module.scss";
import { CheckInCard } from "./components/CheckInCard";
import { FaceScannerErrorBoundary } from "./components/FaceScannerErrorBoundary";
import { IdlePromoCard } from "./components/IdlePromoCard";
import type {
  MobileFaceScannerHandle,
  MobileFaceScannerState,
} from "./components/MobileFaceScanner";
import {
  PwaCheckInScannerShell,
  type CheckInMode,
  type MobileScanStatus,
} from "./components/PwaCheckInScannerShell";
import { VoiceWave } from "./components/VoiceWave";
import {
  mapAttendanceToDisplayResult,
  mapCoachToDisplayResult,
  type PwaCheckInDisplayResult,
} from "./utils/checkInDisplayResult";
import logo from "/taekwondo.jpg";

const SCAN_COOLDOWN_MS = 2500;
const LazyFaceScanner = lazy(() =>
  import("@/features/checkIn/components/FaceScanner").then((module) => ({
    default: module.FaceScanner,
  })),
);
const LazyMobileCodeScanner = lazy(
  () => import("./components/MobileCodeScanner"),
);
const LazyMobileFaceScanner = lazy(
  () => import("./components/MobileFaceScanner"),
);
const CODE_SCANNER_FORMATS: BarcodeFormat[] = [
  "qr_code",
  "code_128",
  "code_39",
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
  "itf",
  "codabar",
];

const getDefaultCheckInMode = (): CheckInMode => "FACE_SCAN";

const getCheckInModeMessage = (mode: CheckInMode) =>
  mode === "CODE_SCAN"
    ? "Sẵn sàng quét QR code hoặc barcode."
    : "Sẵn sàng nhận diện khuôn mặt.";

const getCheckInModeLabel = (mode: CheckInMode) =>
  mode === "CODE_SCAN" ? "Quét mã" : "AI khuôn mặt";

const getCodeFormat = (format?: string): ScannedCheckInCodeFormat => {
  if (!format) return "unknown";
  return format.toLowerCase().includes("qr") ? "qr" : "barcode";
};

const getAxiosErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) return null;

  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    return typeof message === "string" && message.trim() ? message : null;
  }

  return null;
};

const getScannedSubjectLabel = (code?: string | null) =>
  code?.trim().toUpperCase().startsWith("VQT") ? "Huấn luyện viên" : "Học viên";

const getCheckInErrorMessage = (error: unknown, code?: string) => {
  const backendMessage = getAxiosErrorMessage(error);
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const noi = getScannedSubjectLabel(code);
  const message = code?.trim().toUpperCase().startsWith("VQT")
    ? backendMessage?.replace(/\bHọc viên\b/g, noi)
    : backendMessage;

  switch (status) {
    case 400:
      return message ?? `${noi} không hợp lệ hoặc chưa ở trạng thái hoạt động.`;
    case 404:
      return message ?? "Không tìm thấy ca học phù hợp.";
    case 409:
      return message ?? `${noi} đã được điểm danh trong ca học phù hợp.`;
    default:
      return message ?? "Không thể kết nối API. Vui lòng quét lại.";
  }
};

const mapAttendanceRecordToCheckInResult = (
  attendanceRecord: StudentAttendanceResponse,
): CheckInResponse => {
  const checkedInAt = attendanceRecord.checkInTime
    ? new Date(attendanceRecord.checkInTime).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
    : null;

  const statusLabel = attendanceRecord.attendanceStatus
    ? AttendanceStatusLabel[attendanceRecord.attendanceStatus]
    : null;

  const successCore = statusLabel
    ? `Điểm danh thành công · ${statusLabel}`
    : "Điểm danh thành công";

  return {
    audio_signal: "CHECKIN_SUCCESS",
    status: true,
    user: null,
    attendance_record: attendanceRecord,
    message: checkedInAt
      ? `${successCore} lúc ${checkedInAt}.`
      : `${successCore}.`,
    isAudioFinished: true,
  };
};

const mapCoachTimesheetToCheckInResult = (
  timesheet: CoachTimesheetResponse,
): CheckInResponse => {
  const checkedInAt = timesheet.checkInTime
    ? new Date(timesheet.checkInTime).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
    : null;

  return {
    audio_signal: "CHECKIN_SUCCESS",
    status: true,
    user: null,
    attendance_record: null,
    message: checkedInAt
      ? `Chấm công HLV thành công lúc ${checkedInAt}.`
      : "Chấm công HLV thành công.",
    isAudioFinished: true,
  };
};

const mapFaceToDisplayResult = (
  response: CheckInResponse,
): PwaCheckInDisplayResult | null => {
  if (!response.status) {
    const person = response.recognizedPerson;
    if (!person) return null;

    return {
      title:
        person.personType === "STUDENT"
          ? "Điểm danh chưa thành công"
          : "Chấm công HLV chưa thành công",
      name: person.fullName,
      details:
        person.personType === "STUDENT"
          ? [
            { label: "Mã học viên", value: person.studentCode },
            { label: "Ngày sinh", value: formatScanDate(person.birthDate) },
            { label: "Giới tính", value: person.gender === true ? "Nam" : "Nữ" },
            { label: "Đai", value: BeltLabel[person.belt] },
            { label: "Trạng thái", value: StudentStatusLabel[person.studentStatus] },
          ]
          : [
            { label: "Mã HLV", value: person.staffCode },
            { label: "Ngày sinh", value: formatScanDate(person.birthDate) },
            { label: "Giới tính", value: person.gender === true ? "Nam" : "Nữ" },
            { label: "Đai", value: BeltLabel[person.belt] },
            { label: "Trạng thái", value: CoachStatusLabel[person.coachStatus] },
            { label: "Email", value: person.email ?? "Chưa có dữ liệu" },
          ],
    };
  }

  if (response.attendance_record) {
    return mapAttendanceToDisplayResult(response.attendance_record);
  }

  if (response.coachTimesheet) {
    return mapCoachToDisplayResult(response.coachTimesheet);
  }

  const profile = response.user?.userProfile;
  const userInfo = response.user?.userInfo;

  return {
    title: "Check-in thành công",
    name: profile?.name,
    details: [
      {
        label: "Mã định danh",
        value: userInfo?.userCode ?? "Chưa có dữ liệu",
      },
      {
        label: "Thời gian",
        value: formatScanTime(new Date()),
      },
      {
        label: "Trạng thái",
        value: "Đã ghi nhận",
      },
    ],
  };
};

const formatScanDate = (value?: string | Date | null) => {
  if (!value) return "Chưa có dữ liệu";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatScanTime = (value?: string | Date | null) => {
  if (!value) return "Chưa có dữ liệu";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function ScannerLoadingFallback() {
  return (
    <div className={styles.mobileScannerLoading} role="status">
      <Loader2 size={18} />
      <span>Dang mo camera...</span>
    </div>
  );
}

export default function AICheckIn() {
  const navigate = useNavigate();
  const [checkInResult, setCheckInResult] = useState<CheckInResponse | null>(
    null,
  );
  const [scanAttendanceResult, setScanAttendanceResult] =
    useState<StudentAttendanceResponse | null>(null);
  const [scanCoachTimesheetResult, setScanCoachTimesheetResult] =
    useState<CoachTimesheetResponse | null>(null);
  const [displayResult, setDisplayResult] =
    useState<PwaCheckInDisplayResult | null>(null);
  const [checkInMode, setCheckInMode] = useState<CheckInMode>(
    getDefaultCheckInMode,
  );
  const [mobileScanStatus, setMobileScanStatus] =
    useState<MobileScanStatus>("scanning");
  const [qrFacingMode, setQrFacingMode] = useState<
    "user" | "environment"
  >("environment");
  const [mobileScanMessage, setMobileScanMessage] = useState(
    getCheckInModeMessage(getDefaultCheckInMode()),
  );
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [successfulScanCount, setSuccessfulScanCount] = useState(0);
  const mobileScannerConstraints = useMemo<MediaTrackConstraints>(
    () => ({
      facingMode: { ideal: qrFacingMode },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      aspectRatio: { ideal: 16 / 9 },
    }),
    [qrFacingMode],
  );
  const lastScanRef = useRef({ code: "", time: 0 });
  const activeScanRequestRef = useRef(0);
  const mobileFaceScannerRef = useRef<MobileFaceScannerHandle | null>(null);
  const faceResultHandledRef = useRef(false);
  // Mirror state vào ref để beforeunload log giá trị mới mà không cần re-subscribe effect beforeunload
  const mobileScanStatusRef = useRef<MobileScanStatus>(mobileScanStatus);
  const lastScannedCodeRef = useRef<string | null>(lastScannedCode);
  useEffect(() => {
    mobileScanStatusRef.current = mobileScanStatus;
    lastScannedCodeRef.current = lastScannedCode;
  }, [mobileScanStatus, lastScannedCode]);

  const isMobileSubmitting = mobileScanStatus === "submitting";
  const scannerPaused =
    mobileScanStatus !== "scanning" || isMobileSubmitting || !!checkInResult;
  const showMobileBackButton =
    mobileScanStatus === "scanning" && !checkInResult && !lastScannedCode;
  const isCodeScanMode = checkInMode === "CODE_SCAN";
  const isFaceScanMode = checkInMode === "FACE_SCAN";

  const mobileStatusLabel = useMemo(() => {
    switch (mobileScanStatus) {
      case "ready":
        return "Sẵn sàng quét";
      case "scanning":
        return "Đang quét";
      case "code_detected":
        return "Đã nhận mã";
      case "submitting":
        return "Đang gọi API";
      case "success":
        return "Thành công";
      case "error":
        return "Lỗi";
      case "canceled":
        return "Đã hủy thao tác";
      default:
        return "Sẵn sàng quét";
    }
  }, [mobileScanStatus]);

  const resetCheckInSession = useCallback((nextMode: CheckInMode) => {
    activeScanRequestRef.current += 1;
    lastScanRef.current = { code: "", time: 0 };
    faceResultHandledRef.current = false;
    setScanAttendanceResult(null);
    setScanCoachTimesheetResult(null);
    setDisplayResult(null);
    setLastScannedCode(null);
    setMobileScanStatus("scanning");
    setMobileScanMessage(getCheckInModeMessage(nextMode));
  }, []);

  const handleChangeCheckInMode = useCallback(
    (nextMode: CheckInMode) => {
      if (nextMode === checkInMode) {
        return;
      }

      activeScanRequestRef.current += 1;
      setCheckInResult(null);
      setCheckInMode(nextMode);
      resetCheckInSession(nextMode);
    },
    [checkInMode, resetCheckInSession],
  );

  const handleMobileBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/", { replace: true });
  }, [navigate]);

  const handleCloseCard = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setCheckInResult(null);
    resetCheckInSession(checkInMode);
  }, [checkInMode, resetCheckInSession]);

  const handleFaceCheckInResult = useCallback(
    (result: CheckInResponse | null) => {
      setCheckInResult(result);
      if (!result) return;

      const isSuccess = result.status;
      const message =
        result.message ??
        (isSuccess
          ? "Đã ghi nhận check-in thành công."
          : "Không thể xử lý check-in. Vui lòng thử lại.");

      setMobileScanMessage(message);
      setMobileScanStatus(isSuccess ? "success" : "error");
      setDisplayResult(mapFaceToDisplayResult(result));

      if (isSuccess) {
        if (result.attendance_record) {
          setScanAttendanceResult(result.attendance_record);
          setScanCoachTimesheetResult(null);
        } else if (result.coachTimesheet) {
          setScanAttendanceResult(null);
          setScanCoachTimesheetResult(result.coachTimesheet);
        }
      }

      if (isSuccess && !faceResultHandledRef.current) {
        faceResultHandledRef.current = true;
        setSuccessfulScanCount((count) => count + 1);
      }
    },
    [],
  );

  const handleFaceScannerState = useCallback(
    (state: MobileFaceScannerState) => {
      if (checkInResult) return;

      switch (state.status) {
        case "loading-model":
          setMobileScanStatus("ready");
          setMobileScanMessage("Đang tải AI nhận diện khuôn mặt...");
          break;
        case "requesting-camera":
          setMobileScanStatus("ready");
          setMobileScanMessage("Đang mở camera trước...");
          break;
        case "scanning":
          setMobileScanStatus("scanning");
          setMobileScanMessage("Giữ khuôn mặt rõ và nhìn thẳng vào camera.");
          break;
        case "submitting":
          setMobileScanStatus("submitting");
          setMobileScanMessage("Đang gửi ảnh nhận diện để check-in...");
          break;
        case "error":
          setMobileScanStatus("error");
          setMobileScanMessage(
            state.errorMessage ??
            "Không thể sử dụng AI khuôn mặt. Vui lòng thử lại.",
          );
          break;
      }
    },
    [checkInResult],
  );

  const submitScannedCode = useCallback(
    async (rawCode: string, rawFormat?: string) => {
      writeDebugStorage("aiCheckIn_submitScannedCode_called", {
        rawCode,
        rawFormat,
      });

      const now = Date.now();
      if (
        lastScanRef.current.code === rawCode &&
        now - lastScanRef.current.time < SCAN_COOLDOWN_MS
      ) {
        return;
      }

      lastScanRef.current = { code: rawCode, time: now };

      const trimmedCode = rawCode.trim();

      setLastScannedCode(trimmedCode);
      setMobileScanStatus("code_detected");
      setMobileScanMessage("Đã nhận mã. Đang chuẩn bị gửi check-in...");

      const scanRequestId = activeScanRequestRef.current + 1;
      activeScanRequestRef.current = scanRequestId;
      setMobileScanStatus("submitting");
      setMobileScanMessage("Đang xử lý check-in, vui lòng chờ trong giây lát.");

      try {
        const routedResult = await submitScannedCheckInCode({
          rawValue: trimmedCode,
          format: getCodeFormat(rawFormat),
        });

        if (activeScanRequestRef.current !== scanRequestId) {
          return;
        }

        // API mới không có field `status` → xác định success bằng attendanceId
        setLastScannedCode(routedResult.normalizedCode);

        const isSuccess =
          routedResult.type === "student-attendance"
            ? Boolean(routedResult.data?.attendanceId)
            : Boolean(routedResult.data?.timesheetId);

        if (!isSuccess) {
          const message =
            routedResult.type === "student-attendance"
              ? "Không thể điểm danh với mã này."
              : "Không thể chấm công HLV với mã này.";
          setMobileScanStatus("error");
          setMobileScanMessage(message);
          setCheckInResult({
            audio_signal: "NO_VALID_SESSION",
            status: false,
            user: null,
            attendance_record: null,
            message,
            isAudioFinished: true,
          });
          void playSound("error");
          return;
        }

        const nextResult =
          routedResult.type === "student-attendance"
            ? mapAttendanceRecordToCheckInResult(routedResult.data)
            : mapCoachTimesheetToCheckInResult(routedResult.data);

        if (routedResult.type === "student-attendance") {
          setScanAttendanceResult(routedResult.data);
          setScanCoachTimesheetResult(null);
          setDisplayResult(mapAttendanceToDisplayResult(routedResult.data));
        } else {
          setScanAttendanceResult(null);
          setScanCoachTimesheetResult(routedResult.data);
          setDisplayResult(mapCoachToDisplayResult(routedResult.data));
        }
        setCheckInResult(null);
        setMobileScanStatus("success");
        setMobileScanMessage(nextResult.message ?? "Check-in thành công.");
        setSuccessfulScanCount((count) => count + 1);
        void playSound("success");
      } catch (error) {
        if (activeScanRequestRef.current !== scanRequestId) {
          return;
        }

        console.error("Scanned code check-in failed:", error);
        const message =
          error instanceof ScannedCheckInCodeError
            ? error.message
            : getCheckInErrorMessage(error, trimmedCode);
        setMobileScanStatus("error");
        setMobileScanMessage(message);
        setCheckInResult({
          audio_signal: axios.isAxiosError(error) && error.response?.status === 409
            ? "ALREADY_CHECKED_IN"
            : "NO_VALID_SESSION",
          status: false,
          user: null,
          attendance_record: null,
          message,
          isAudioFinished: true,
        });
        void playSound("error");
      }
    },
    [],
  );

  const handleMobileScan = useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      const detectedCode = detectedCodes[0];
      writeDebugStorage("aiCheckIn_lastScanEvent", {
        count: detectedCodes.length,
        rawValue: detectedCode?.rawValue,
        format: detectedCode?.format,
        scannerPaused,
      });
      if (!detectedCode?.rawValue || scannerPaused) return;
      void submitScannedCode(detectedCode.rawValue, detectedCode.format);
    },
    [scannerPaused, submitScannedCode],
  );

  const handleMobileScannerError = useCallback((error: unknown) => {
    console.warn("Mobile code scanner error:", error);
    setMobileScanStatus("error");
    setMobileScanMessage(
      "Không mở được camera quét mã. Kiểm tra quyền camera và thử lại.",
    );
  }, []);

  const cancelMobileCheckIn = useCallback(() => {
    activeScanRequestRef.current += 1;
    if (checkInMode === "FACE_SCAN") {
      mobileFaceScannerRef.current?.cancelPendingCheckIn();
    }
    setScanAttendanceResult(null);
    setScanCoachTimesheetResult(null);
    setDisplayResult(null);
    setCheckInResult(null);
    setMobileScanStatus("canceled");
    setMobileScanMessage("Đã hủy thao tác hiện tại. Bạn có thể quét lại.");
    setLastScannedCode(null);
  }, [checkInMode]);

  const handleScanResultOk = useCallback(() => {
    setScanAttendanceResult(null);
    setScanCoachTimesheetResult(null);
    setDisplayResult(null);
    setCheckInResult(null);
    setLastScannedCode(null);
    setMobileScanStatus("scanning");
    setMobileScanMessage(getCheckInModeMessage(checkInMode));
    faceResultHandledRef.current = false;
    lastScanRef.current = { code: "", time: 0 };
  }, [checkInMode]);

  const handleRetryScan = useCallback(() => {
    setScanAttendanceResult(null);
    setScanCoachTimesheetResult(null);
    setDisplayResult(null);
    setLastScannedCode(null);
    lastScanRef.current = { code: "", time: 0 };

    if (checkInMode === "FACE_SCAN") {
      if (checkInResult) {
        setCheckInResult(null);
        setMobileScanStatus("scanning");
        setMobileScanMessage(getCheckInModeMessage("FACE_SCAN"));
        faceResultHandledRef.current = false;
        return;
      }

      mobileFaceScannerRef.current?.retry();
      return;
    }

    handleCloseCard();
  }, [checkInMode, checkInResult, handleCloseCard]);

  const handleSwitchCamera = useCallback(() => {
    if (checkInMode === "FACE_SCAN") {
      mobileFaceScannerRef.current?.switchCamera();
      return;
    }

    setQrFacingMode((previous) =>
      previous === "user" ? "environment" : "user",
    );
  }, [checkInMode]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      writeDebugStorage("aiCheckIn_beforeUnload_debug", {
        path: window.location.pathname,
        status: mobileScanStatusRef.current,
        lastScannedCode: lastScannedCodeRef.current,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      activeScanRequestRef.current += 1;
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <>
      <div className={styles.page}>
        {/* Background Top Decoration */}
        <div className={styles.topBar} />

        {/* Left Panel: Live Camera Feed */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.24,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={styles.leftPanel}
        >
          <div
            className={`${styles.brandLogo} ${(isCodeScanMode || APP_MODE === "pwa") ? styles.brandLogoHidden : ""
              }`}
          >
            <img
              src={logo}
              alt="Taekwondo Văn Quán"
              className={styles.brandMarkImage}
            />
            <div>
              <h2 className={styles.brandTitle}>Taekwondo Văn Quán</h2>
              <p className={styles.brandSubtitle}>AI Check-in</p>
            </div>
          </div>

          {APP_MODE !== "desktop" && (
            <PwaCheckInScannerShell
              mode={checkInMode}
              status={mobileScanStatus}
              statusLabel={mobileStatusLabel}
              message={mobileScanMessage}
              lastScannedCode={lastScannedCode}
              successfulScanCount={successfulScanCount}
              displayResult={displayResult}
              showBackButton={showMobileBackButton}
              onModeChange={handleChangeCheckInMode}
              onBack={handleMobileBack}
              onSwitchCamera={handleSwitchCamera}
              onCancel={cancelMobileCheckIn}
              onRetry={handleRetryScan}
              onResultOk={handleScanResultOk}
              camera={
                isCodeScanMode ? (
                  <Suspense fallback={<ScannerLoadingFallback />}>
                    <LazyMobileCodeScanner
                      onScan={handleMobileScan}
                      onError={handleMobileScannerError}
                      paused={scannerPaused}
                      formats={CODE_SCANNER_FORMATS}
                      constraints={mobileScannerConstraints}
                      containerClassName={`${styles.mobileScanner} ${qrFacingMode === "user"
                        ? styles.mobileScanner_front
                        : styles.mobileScanner_back
                        }`}
                    />
                  </Suspense>
                ) : (
                  <FaceScannerErrorBoundary>
                    <Suspense fallback={<ScannerLoadingFallback />}>
                      <LazyMobileFaceScanner
                        ref={mobileFaceScannerRef}
                        checkInResult={checkInResult}
                        onCheckInResult={handleFaceCheckInResult}
                        onStateChange={handleFaceScannerState}
                        videoClassName={styles.mobileScanner}
                        mirroredClassName={styles.mobileScanner_front}
                      />
                    </Suspense>
                  </FaceScannerErrorBoundary>
                )
              }
            />
          )}

          {APP_MODE === "desktop" && (
            <div className={styles.mobileModeSwitch} aria-label="Chọn chế độ check-in">
              <button
                type="button"
                className={`${styles.mobileModeButton} ${isFaceScanMode ? styles.mobileModeButtonActive : ""
                  }`}
                onClick={() => handleChangeCheckInMode("FACE_SCAN")}
              >
                {getCheckInModeLabel("FACE_SCAN")}
              </button>
              <button
                type="button"
                className={`${styles.mobileModeButton} ${isCodeScanMode ? styles.mobileModeButtonActive : ""
                  }`}
                onClick={() => handleChangeCheckInMode("CODE_SCAN")}
              >
                {getCheckInModeLabel("CODE_SCAN")}
              </button>
            </div>
          )}

          {APP_MODE === "desktop" && isCodeScanMode && (
            <div
              className={`${styles.mobileScanShell} ${styles.mobileScanShellVisible} ai-check-in-mobile-scan`}
            >
              <div className={styles.mobileScanHeader}>
                {showMobileBackButton && (
                  <button
                    type="button"
                    className={styles.mobileBackButton}
                    onClick={handleMobileBack}
                    aria-label="Trở về màn hình trước đó"
                  >
                    <ChevronLeft size={18} />
                    <span>Trở về</span>
                  </button>
                )}
                <div className={styles.mobileBrandBlock}>
                  <img
                    src={logo}
                    alt="Taekwondo Văn Quán"
                    className={styles.mobileBrandLogo}
                  />
                  <div>
                    <p className={styles.mobileScanEyebrow}>PWA scanner</p>
                    <h1 className={styles.mobileScanTitle}>
                      Quét mã {getScannedSubjectLabel(lastScannedCode).toLowerCase()}
                    </h1>
                  </div>
                </div>
                <div className={styles.mobileScanHeaderActions}>
                  <div
                    className={`${styles.mobileScanState} ${styles[`mobileScanState_${mobileScanStatus}`]
                      }`}
                  >
                    {mobileScanStatus === "submitting" ? (
                      <Loader2 size={14} />
                    ) : mobileScanStatus === "success" ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <QrCode size={14} />
                    )}
                    <span>{mobileStatusLabel}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.mobileCameraSwitchButton}
                    onClick={() =>
                      setQrFacingMode((prev) =>
                        prev === "user" ? "environment" : "user",
                      )
                    }
                  >
                    Đổi camera
                  </button>
                </div>
              </div>

              <div className={styles.mobileScannerFrame}>
                <Suspense fallback={<ScannerLoadingFallback />}>
                  <LazyMobileCodeScanner
                    onScan={handleMobileScan}
                    onError={handleMobileScannerError}
                    paused={scannerPaused}
                    formats={CODE_SCANNER_FORMATS}
                    constraints={mobileScannerConstraints}
                    containerClassName={`${styles.mobileScanner} ${qrFacingMode === "user"
                      ? styles.mobileScanner_front
                      : styles.mobileScanner_back
                      }`}
                  />
                </Suspense>
                <div className={styles.mobileScannerMask} aria-hidden="true" />
                <div className={styles.mobileScannerLine} aria-hidden="true" />
              </div>

              <div
                className={`${styles.mobileFeedbackPanel} ${styles[`mobileFeedbackPanel_${mobileScanStatus}`]
                  }`}
              >
                {mobileScanStatus === "success" &&
                  (scanAttendanceResult || scanCoachTimesheetResult) ? (
                  scanAttendanceResult ? (
                    <div className={styles.mobileAttendanceDetails}>
                      <div className={styles.mobileAttendanceSummary}>
                        <span className={styles.mobileAttendanceStatusDot} />
                        <div>
                          <p className={styles.mobileFeedbackLabel}>
                            Điểm danh thành công
                          </p>
                          <h2 className={styles.mobileAttendanceStudentName}>
                            {scanAttendanceResult.student.fullName}
                          </h2>
                        </div>
                      </div>

                      <div className={styles.mobileAttendanceDetailList}>
                        <div>
                          <span>Lớp</span>
                          <strong>
                            {scanAttendanceResult.classSchedule?.scheduleId ??
                              "Chưa có dữ liệu"}
                          </strong>
                        </div>
                        <div>
                          <span>Ngày học</span>
                          <strong>
                            {formatScanDate(scanAttendanceResult.sessionDate)}
                          </strong>
                        </div>
                        <div>
                          <span>Giờ điểm danh</span>
                          <strong>
                            {formatScanTime(scanAttendanceResult.checkInTime)}
                          </strong>
                        </div>
                        <div>
                          <span>Trạng thái</span>
                          <strong>
                            {scanAttendanceResult.attendanceStatus
                              ? (AttendanceStatusLabel[
                                scanAttendanceResult.attendanceStatus
                              ] ?? scanAttendanceResult.attendanceStatus)
                              : "Chưa có dữ liệu"}
                          </strong>
                        </div>
                        {scanAttendanceResult.note && (
                          <div className={styles.mobileAttendanceNote}>
                            <span>Ghi chú</span>
                            <strong>{scanAttendanceResult.note}</strong>
                          </div>
                        )}
                      </div>

                      {successfulScanCount > 0 && (
                        <p className={styles.mobileSuccessCount}>
                          Đã điểm danh {successfulScanCount} người trong phiên này.
                        </p>
                      )}

                      <button
                        type="button"
                        className={styles.mobileAttendanceOkButton}
                        onClick={handleScanResultOk}
                      >
                        OK
                      </button>
                    </div>
                  ) : scanCoachTimesheetResult ? (
                    <div className={styles.mobileAttendanceDetails}>
                      <div className={styles.mobileAttendanceSummary}>
                        <span className={styles.mobileAttendanceStatusDot} />
                        <div>
                          <p className={styles.mobileFeedbackLabel}>
                            Chấm công HLV thành công
                          </p>
                          <h2 className={styles.mobileAttendanceStudentName}>
                            {scanCoachTimesheetResult.coach?.fullName ??
                              "Huấn luyện viên"}
                          </h2>
                        </div>
                      </div>

                      <div className={styles.mobileAttendanceDetailList}>
                        <div>
                          <span>Lớp</span>
                          <strong>
                            {scanCoachTimesheetResult.classSchedule
                              ?.scheduleId ?? "Chưa có dữ liệu"}
                          </strong>
                        </div>
                        <div>
                          <span>Ngày làm việc</span>
                          <strong>
                            {formatScanDate(
                              scanCoachTimesheetResult.workingDate,
                            )}
                          </strong>
                        </div>
                        <div>
                          <span>Giờ check-in</span>
                          <strong>
                            {formatScanTime(
                              scanCoachTimesheetResult.checkInTime,
                            )}
                          </strong>
                        </div>
                        <div>
                          <span>Trạng thái</span>
                          <strong>{scanCoachTimesheetResult.status}</strong>
                        </div>
                        {scanCoachTimesheetResult.note && (
                          <div className={styles.mobileAttendanceNote}>
                            <span>Ghi chú</span>
                            <strong>{scanCoachTimesheetResult.note}</strong>
                          </div>
                        )}
                      </div>

                      {successfulScanCount > 0 && (
                        <p className={styles.mobileSuccessCount}>
                          Đã check-in {successfulScanCount} người trong phiên này.
                        </p>
                      )}

                      <button
                        type="button"
                        className={styles.mobileAttendanceOkButton}
                        onClick={handleScanResultOk}
                      >
                        OK
                      </button>
                    </div>
                  ) : null
                ) : (
                  <>
                    <p className={styles.mobileFeedbackLabel}>{mobileStatusLabel}</p>
                    <p className={styles.mobileFeedbackMessage}>
                      {mobileScanMessage}
                    </p>
                    {lastScannedCode && (
                      <p className={styles.mobileScannedCode}>
                        Mã vừa quét: <span>{lastScannedCode}</span>
                      </p>
                    )}
                    {successfulScanCount > 0 && (
                      <p className={styles.mobileSuccessCount}>
                        Đã điểm danh {successfulScanCount} người trong phiên này.
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className={styles.mobileScanActions}>
                {isMobileSubmitting && (
                  <button
                    type="button"
                    className={styles.mobileCancelButton}
                    onClick={cancelMobileCheckIn}
                  >
                    <X size={18} />
                    Hủy
                  </button>
                )}

                {(mobileScanStatus === "error" ||
                  mobileScanStatus === "canceled") && (
                    <button
                      type="button"
                      className={styles.mobilePrimaryButton}
                      onClick={handleCloseCard}
                    >
                      <RotateCcw size={18} />
                      Quét tiếp
                    </button>
                  )}
              </div>
            </div>
          )}

          {APP_MODE === "desktop" && isFaceScanMode && (
            <div className={styles.cameraWrapper}>
              <FaceScannerErrorBoundary>
                <Suspense fallback={<ScannerLoadingFallback />}>
                  <LazyFaceScanner
                    checkInResult={checkInResult}
                    onCheckInResult={handleFaceCheckInResult}
                    onBack={handleMobileBack}
                  />
                </Suspense>
              </FaceScannerErrorBoundary>
            </div>
          )}
        </motion.div>

        {/* Right Panel: AI Receptionist Info */}
        <div className={styles.rightPanel}>
          {/* Subtle background branding/watermark */}
          <div className={styles.watermark}>
            <ShieldAlert />
          </div>

          {/* Floating Check-In Card */}
          <div className={styles.cardWrapper}>
            <IdlePromoCard />
          </div>
        </div>

        {/* Voice Assistant Indicator */}
        <div className={styles.voiceWaveWrapper}>
          <VoiceWave />
        </div>
      </div>

      {APP_MODE === "desktop" && checkInResult && (
        <CheckInCard
          user={checkInResult}
          onConfirm={handleScanResultOk}
        />
      )}
    </>
  );
}
