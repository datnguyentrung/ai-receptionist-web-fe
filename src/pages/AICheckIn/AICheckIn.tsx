import { FaceScanner } from "@components/FaceScanner";
import { ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import styles from "./AICheckIn.module.scss";
import { CheckInCard } from "./components/CheckInCard";
import { VoiceWave } from "./components/VoiceWave";

export default function AICheckIn() {
  return (
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
          <FaceScanner />
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
          <CheckInCard />
        </div>
      </div>

      {/* Voice Assistant Indicator */}
      <VoiceWave />
    </div>
  );
}
