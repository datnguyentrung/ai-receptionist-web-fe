import logo from "@/assets/taekwondo.jpg";
import { CheckCircle, Clock, MapPin, UserCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { UserResponse } from "../../../types";
import styles from "./CheckInCard.module.scss";

const AUTO_DISMISS_SECONDS = 3;

type CheckInCardProps = {
  user: UserResponse;
  startAutoDismiss: boolean;
  onClose: () => void;
};

export function CheckInCard({
  user,
  startAutoDismiss,
  onClose,
}: CheckInCardProps) {
  const [countdown, setCountdown] = useState(AUTO_DISMISS_SECONDS);

  useEffect(() => {
    if (!startAutoDismiss) {
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [startAutoDismiss, onClose]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const progress = startAutoDismiss
    ? ((AUTO_DISMISS_SECONDS - countdown) / AUTO_DISMISS_SECONDS) * 100
    : 0;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className={styles.overlay}
        onClick={onClose}
      >
        <motion.div
          key="modal-card"
          initial={{ opacity: 0, scale: 0.88, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 40 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.35 }}
          className={styles.card}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress auto-dismiss bar */}
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.9, ease: "linear" }}
            />
          </div>

          {/* Decorative top strip */}
          <div className={styles.topStrip} />

          {/* Close button */}
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          <div className={styles.body}>
            {/* Success Header */}
            <div className={styles.header}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 200 }}
                className={styles.iconCircle}
              >
                <CheckCircle size={40} strokeWidth={2.5} />
              </motion.div>
              <div>
                <h1 className={styles.successTitle}>Check-in Successful</h1>
                <p className={styles.successSubtitle}>Attendance Recorded</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className={styles.profile}>
              <div className={styles.avatarWrapper}>
                <motion.img
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  src={logo}
                  alt="Student"
                  className={styles.avatar}
                />
                <div className={styles.verifiedBadge}>
                  <CheckCircle size={12} strokeWidth={3} />
                </div>
              </div>
              <div>
                <h2 className={styles.studentName}>{user.userProfile.name}</h2>
                <div className={styles.beltBadge}>
                  <span className={styles.beltDot} />
                  {user.userProfile.belt || "No Belt"}
                </div>
                <p className={styles.memberId}>
                  <UserCircle size={16} />
                  Member #{user.userProfile.phone}
                </p>
              </div>
            </div>

            {/* Schedule Info */}
            <div className={styles.scheduleGrid}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
                className={styles.infoCard}
              >
                <div className={styles.infoCardLabel}>
                  <Clock />
                  <span>Time</span>
                </div>
                <p className={styles.infoCardTime}>{timeStr}</p>
                <p className={styles.infoCardNote}>On Time</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
                className={styles.infoCardAccent}
              >
                <div className={styles.infoCardAccentLabel}>
                  <MapPin />
                  <span>Next Class</span>
                </div>
                <p className={styles.infoCardAccentTitle}>Advanced Sparring</p>
                <p className={styles.infoCardAccentNote}>18:00 - Mat B</p>
              </motion.div>
            </div>
          </div>

          {/* Auto-dismiss hint */}
          <div className={styles.dismissHint}>
            {startAutoDismiss
              ? `Tự động đóng sau ${countdown}s \u00A0\u00B7\u00A0 Nhấn bên ngoài để đóng`
              : "Dang phat audio huong dan..."}
          </div>

          {/* Decorative dots / texture */}
          <div className={styles.decorDots}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <pattern
                id="dots"
                x="0"
                y="0"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="2" fill="#E02020" />
              </pattern>
              <rect width="100" height="100" fill="url(#dots)" />
            </svg>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
