import logo from "/taekwondo.jpg";
import type { CheckInResponse } from "@/types";
import { CheckCircle, Clock, MapPin, UserCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import styles from "./CheckInCard.module.scss";

const AUTO_DISMISS_SECONDS = 5;

type CheckInCardProps = {
  user: (CheckInResponse & { isAudioFinished?: boolean }) | null;
  onClose: () => void;
};

export function CheckInCard({ user, onClose }: CheckInCardProps) {
  // Luôn khởi tạo là 5s khi component này được mount
  const [countdown, setCountdown] = useState(AUTO_DISMISS_SECONDS);

  const isAudioFinished = !!user?.isAudioFinished;

  useEffect(() => {
    // Nếu AI CHƯA đọc xong thì KHÔNG LÀM GÌ CẢ (không đếm ngược, cũng không cần setState)
    // Vì mặc định countdown đang là 5 rồi.
    if (!isAudioFinished) {
      return;
    }

    // Khi đã đọc xong (isAudioFinished === true), BẮT ĐẦU đếm ngược
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
  }, [isAudioFinished, onClose]); // Dependencies giữ nguyên

  const now = new Date();
  const timeStr = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Tính toán % để thanh progress chạy mượt
  const progress = isAudioFinished
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

          <div className={styles.topStrip} />

          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          <div className={styles.body}>
            <div className={styles.aiMessageWrapper}>
              <motion.h1
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className={styles.aiMessage}
              >
                {user?.message || ""}
              </motion.h1>
            </div>

            {user?.user && (
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
                  <h2 className={styles.studentName}>
                    {user.user?.userProfile?.name}
                  </h2>
                  <div className={styles.beltBadge}>
                    <span className={styles.beltDot} />
                    {user.user?.userProfile?.belt || "No Belt"}
                  </div>
                  <p className={styles.memberId}>
                    <UserCircle size={16} />
                    Member #{user.user?.userProfile?.phone}
                  </p>
                </div>
              </div>
            )}

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

          {/* Cập nhật UI chỗ text hướng dẫn */}
          <div className={styles.dismissHint}>
            {isAudioFinished
              ? `Tự động đóng sau ${countdown}s \u00A0\u00B7\u00A0 Nhấn bên ngoài để đóng`
              : "Đang phát âm thanh hướng dẫn..."}
          </div>

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
