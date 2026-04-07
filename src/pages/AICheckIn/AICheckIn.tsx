import type { AttendanceRecord } from "@/types";
import { FaceScanner } from "@components/FaceScanner";
import { ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import styles from "./AICheckIn.module.scss";
import { CheckInCard } from "./components/CheckInCard";
import { IdlePromoCard } from "./components/IdlePromoCard";
import { VoiceWave } from "./components/VoiceWave";

export default function AICheckIn() {
  const [checkInResult, setCheckInResult] = useState<AttendanceRecord | null>(
    null,
  );
  const [isAudioFinished, setIsAudioFinished] = useState(false);

  const audioBase64 = checkInResult?.audio_base64;

  // Tạo URL định dạng Data URI để thẻ audio có thể đọc được chuỗi Base64
  const audioUrl = audioBase64 ? `data:audio/mpeg;base64,${audioBase64}` : null;
  const startAutoDismiss = !audioUrl || isAudioFinished;

  const handleCheckInResult = (result: AttendanceRecord | null) => {
    setIsAudioFinished(false);
    setCheckInResult(result);
  };

  const handleCloseCard = () => {
    setIsAudioFinished(false);
    setCheckInResult(null);
  };

  return (
    <>
      <div className={styles.page}>
        {/* Background Top Decoration */}
        <div className={styles.topBar} />

        {/* Left Panel: Live Camera Feed */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={styles.leftPanel}
        >
          <div className={styles.brandLogo}>
            <ShieldAlert className={styles.brandIcon} />
            <div>
              <h2 className={styles.brandTitle}>Dojo SecurID</h2>
              <p className={styles.brandSubtitle}>Kiosk Beta v2.4</p>
            </div>
          </div>

          <div className={styles.cameraWrapper}>
            <FaceScanner
              checkInResult={checkInResult}
              onCheckInResult={handleCheckInResult}
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
        <VoiceWave />
      </div>

      {checkInResult && (
        <CheckInCard
          user={checkInResult}
          startAutoDismiss={startAutoDismiss}
          onClose={handleCloseCard}
        />
      )}

      {/* TRÌNH PHÁT AUDIO TỰ ĐỘNG BẰNG BASE64 */}
      {audioUrl && (
        <audio
          autoPlay
          src={audioUrl}
          onEnded={() => setIsAudioFinished(true)}
          onError={(e) => {
            console.error("Lỗi phát giọng nói:", e);
            setIsAudioFinished(true);
          }}
        />
      )}
    </>
  );
}
