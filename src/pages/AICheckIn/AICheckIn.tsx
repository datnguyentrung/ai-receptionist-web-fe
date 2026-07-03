import type { CheckInResponse } from "@/types";
import { studentAPI } from "@/features/student";
import { playSound } from "@/utils/playSound";
import {
  validateScannedCheckInCode,
  type ScannedCheckInCodeFormat,
} from "@/utils/validateScannedCheckInCode";
import logo from "/taekwondo.jpg";
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import type { BarcodeFormat } from "barcode-detector";
import { FaceScanner } from "@components/FaceScanner";
import {
  ChevronLeft,
  CheckCircle2,
  Loader2,
  QrCode,
  RotateCcw,
  ShieldAlert,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AICheckIn.module.scss";
import { CheckInCard } from "./components/CheckInCard";
import { IdlePromoCard } from "./components/IdlePromoCard";
import { VoiceWave } from "./components/VoiceWave";

const SCAN_COOLDOWN_MS = 2500;
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

type MobileScanStatus =
  | "ready"
  | "scanning"
  | "code_detected"
  | "submitting"
  | "success"
  | "error"
  | "canceled";

const getCodeFormat = (format?: string): ScannedCheckInCodeFormat => {
  if (!format) return "unknown";
  return format.toLowerCase().includes("qr") ? "qr" : "barcode";
};

const buildScannedCodeFormData = (code: string, format: ScannedCheckInCodeFormat) => {
  const formData = new FormData();
  formData.append("scannedCode", code);
  formData.append("scanMode", "CODE");
  formData.append("codeFormat", format);
  formData.append(
    "file",
    new Blob([code], { type: "text/plain" }),
    "scanned-check-in-code.txt",
  );
  return formData;
};

export default function AICheckIn() {
  const navigate = useNavigate();
  const [checkInResult, setCheckInResult] = useState<CheckInResponse | null>(null);
  const [mobileScanStatus, setMobileScanStatus] =
    useState<MobileScanStatus>("scanning");
  const [mobileScanMessage, setMobileScanMessage] = useState(
    "Sẵn sàng quét QR code hoặc barcode.",
  );
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [successfulScanCount, setSuccessfulScanCount] = useState(0);
  const lastScanRef = useRef({ code: "", time: 0 });
  const abortControllerRef = useRef<AbortController | null>(null);

  const isMobileSubmitting = mobileScanStatus === "submitting";
  const scannerPaused =
    mobileScanStatus !== "scanning" || isMobileSubmitting || !!checkInResult;
  const showMobileBackButton =
    mobileScanStatus === "scanning" && !checkInResult && !lastScannedCode;

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

  const resetMobileScanner = useCallback(() => {
    abortControllerRef.current = null;
    setLastScannedCode(null);
    setMobileScanStatus("scanning");
    setMobileScanMessage("Sẵn sàng quét QR code hoặc barcode.");
  }, []);

  const handleMobileBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/", { replace: true });
  }, [navigate]);

  const handleCloseCard = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setCheckInResult(null);
    resetMobileScanner();
  };

  const submitScannedCode = useCallback(
    async (rawCode: string, rawFormat?: string) => {
      const now = Date.now();
      if (
        lastScanRef.current.code === rawCode &&
        now - lastScanRef.current.time < SCAN_COOLDOWN_MS
      ) {
        return;
      }

      lastScanRef.current = { code: rawCode, time: now };

      const validation = validateScannedCheckInCode({
        rawValue: rawCode,
        format: getCodeFormat(rawFormat),
      });

      if (!validation.isValid) {
        setMobileScanStatus("error");
        setMobileScanMessage(
          validation.errorMessage ?? "Mã quét không hợp lệ. Vui lòng thử lại.",
        );
        void playSound("error");
        return;
      }

      setLastScannedCode(validation.normalizedCode);
      setMobileScanStatus("code_detected");
      setMobileScanMessage("Đã nhận mã. Đang chuẩn bị gửi check-in...");

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setMobileScanStatus("submitting");
      setMobileScanMessage("Đang xử lý check-in, vui lòng chờ trong giây lát.");

      try {
        const response = await studentAPI.face_check_in(
          buildScannedCodeFormData(
            validation.normalizedCode,
            validation.format,
          ),
          controller.signal,
        );
        const message =
          response.message ||
          (response.status
            ? "Điểm danh thành công."
            : "Không thể điểm danh với mã này.");
        const nextResult: CheckInResponse = {
          ...response,
          message,
          isAudioFinished: true,
        };

        setCheckInResult(nextResult);
        setMobileScanStatus(response.status ? "success" : "error");
        setMobileScanMessage(message);
        if (response.status) {
          setSuccessfulScanCount((count) => count + 1);
        }
        void playSound(response.status ? "success" : "error");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Scanned code check-in failed:", error);
        setMobileScanStatus("error");
        setMobileScanMessage("Không thể kết nối API. Vui lòng quét lại.");
        void playSound("error");
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [],
  );

  const handleMobileScan = useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      const detectedCode = detectedCodes[0];
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
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setMobileScanStatus("canceled");
    setMobileScanMessage("Đã hủy thao tác hiện tại. Bạn có thể quét lại.");
    setLastScannedCode(null);
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
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
          <div className={styles.brandLogo}>
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

          <div className={`${styles.mobileScanShell} ai-check-in-mobile-scan`}>
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
                  <h1 className={styles.mobileScanTitle}>Quét mã học viên</h1>
                </div>
              </div>
              <div
                className={`${styles.mobileScanState} ${
                  styles[`mobileScanState_${mobileScanStatus}`]
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
            </div>

            <div className={styles.mobileScannerFrame}>
              <Scanner
                onScan={handleMobileScan}
                onError={handleMobileScannerError}
                paused={scannerPaused}
                formats={CODE_SCANNER_FORMATS}
                scanDelay={350}
                sound={false}
                constraints={{ facingMode: "environment" }}
                components={{ finder: false, torch: true }}
                classNames={{ container: styles.mobileScanner }}
              />
              <div className={styles.mobileScannerMask} aria-hidden="true" />
              <div className={styles.mobileScannerLine} aria-hidden="true" />
            </div>

            <div
              className={`${styles.mobileFeedbackPanel} ${
                styles[`mobileFeedbackPanel_${mobileScanStatus}`]
              }`}
            >
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

              {(mobileScanStatus === "success" ||
                mobileScanStatus === "error" ||
                mobileScanStatus === "canceled") && (
                <button
                  type="button"
                  className={styles.mobilePrimaryButton}
                  onClick={handleCloseCard}
                >
                  <RotateCcw size={18} />
                  {mobileScanStatus === "success" ? "OK" : "Quét tiếp"}
                </button>
              )}
            </div>
          </div>

          <div className={styles.cameraWrapper}>
            <FaceScanner
              checkInResult={checkInResult}
              onCheckInResult={setCheckInResult}
            />
          </div>
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

      {checkInResult && (
        <CheckInCard
          user={checkInResult}
          // Truyền true (hoặc một state boolean) để bắt đầu đếm ngược đóng Modal
          onClose={handleCloseCard}
        />
      )}
    </>
  );
}
