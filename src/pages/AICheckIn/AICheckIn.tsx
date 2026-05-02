import type { CheckInResponse } from "@/types";
import { FaceScanner } from "@components/FaceScanner";
import { ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import styles from "./AICheckIn.module.scss";
import { CheckInCard } from "./components/CheckInCard";
import { IdlePromoCard } from "./components/IdlePromoCard";
import { VoiceWave } from "./components/VoiceWave";

export default function AICheckIn() {
  const [checkInResult, setCheckInResult] = useState<CheckInResponse | null>(null);

  const handleCloseCard = () => {
    // 1. Dừng ngay lập tức giọng đọc AI (Text-to-Speech)
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    // Nếu bạn có dùng Audio object cho playSound("success"/"error") và muốn dừng cả nó,
    // bạn sẽ cần expose hàm stopSound() từ utils của bạn ở đây.

    // 2. Đóng Modal
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
          // Truyền true (hoặc một state boolean) để bắt đầu đếm ngược đóng Modal
          onClose={handleCloseCard}
        />
      )}
    </>
  );
}
