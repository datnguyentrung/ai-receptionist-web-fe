import { FaceScanner } from "@components/FaceScanner";
import { ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { UserResponse } from "../../types";
import styles from "./AICheckIn.module.scss";
import { CheckInCard } from "./components/CheckInCard";
import { IdlePromoCard } from "./components/IdlePromoCard";
import { VoiceWave } from "./components/VoiceWave";

export default function AICheckIn() {
  const [checkInResult, setCheckInResult] = useState<UserResponse | null>(null);

  const backendUrl = "http://localhost:8000"; // Thay bằng URL BE của bạn
  const audioUrl = `${backendUrl}/api/v1/tts/greeting?name=${encodeURIComponent(checkInResult?.userProfile.name || "")}&belt=${encodeURIComponent(checkInResult?.userProfile.belt || "")}`;

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
        <VoiceWave />
      </div>

      {checkInResult && (
        <CheckInCard
          user={checkInResult}
          onClose={() => setCheckInResult(null)}
        />
      )}

      {/* TRÌNH PHÁT AUDIO ẨN - TỰ ĐỘNG LẤY GIỌNG NÓI VÀ PHÁT */}
      {audioUrl && (
        <audio
          autoPlay
          src={audioUrl}
          onError={(e) => console.error("Lỗi phát giọng nói:", e)}
        />
      )}
    </>
  );
}
