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
  const attendanceRecord = user?.attendance_record;
  const coachTimesheet = user?.coachTimesheet;
  const checkedInAt = attendanceRecord?.checkInTime ?? coachTimesheet?.checkInTime;
  const checkedInTime = checkedInAt
    ? new Date(checkedInAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : timeStr;
  const displayName =
    user?.user?.userProfile?.name ??
    attendanceRecord?.studentName ??
    coachTimesheet?.coach?.fullName;
  const displayBelt =
    user?.user?.userProfile?.belt ??
    (coachTimesheet ? "Huấn luyện viên" : "Thông tin check-in");
  const memberId =
    user?.user?.userProfile?.phone ??
    attendanceRecord?.studentId ??
    coachTimesheet?.coach?.staffCode;
  const classScheduleId =
    attendanceRecord?.classScheduleId ?? coachTimesheet?.classSchedule?.scheduleId;
  const classLabel = classScheduleId
    ? `Mã lớp ${classScheduleId}`
    : coachTimesheet
      ? "Ca dạy phù hợp"
      : "Ca học phù hợp";
  const sessionDate = attendanceRecord?.sessionDate ?? coachTimesheet?.workingDate;

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

            {displayName && (
              <div className={styles.profile}>
                <div className={styles.avatarWrapper}>
                  <motion.img
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    src={logo}
                    alt="Người được nhận diện"
                    className={styles.avatar}
                  />
                  <div className={styles.verifiedBadge}>
                    <CheckCircle size={12} strokeWidth={3} />
                  </div>
                </div>
                <div>
                  <h2 className={styles.studentName}>
                    {displayName}
                  </h2>
                  <div className={styles.beltBadge}>
                    <span className={styles.beltDot} />
                    {displayBelt}
                  </div>
                  {memberId && (
                    <p className={styles.memberId}>
                      <UserCircle size={16} />
                      Mã định danh: {memberId}
                    </p>
                  )}
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
                  <span>Thời gian</span>
                </div>
                <p className={styles.infoCardTime}>{checkedInTime}</p>
                <p className={styles.infoCardNote}>Đã ghi nhận</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
                className={styles.infoCardAccent}
              >
                <div className={styles.infoCardAccentLabel}>
                  <MapPin />
                  <span>{coachTimesheet ? "Ca dạy" : "Ca tập"}</span>
                </div>
                <p className={styles.infoCardAccentTitle}>{classLabel}</p>
                <p className={styles.infoCardAccentNote}>
                  {sessionDate ?? "Hôm nay"}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Cập nhật UI chỗ text hướng dẫn */}
          <div className={styles.dismissHint}>
            {isAudioFinished
              ? `Tự động đóng sau ${countdown}s \u00A0\u00B7\u00A0 Nhấn bên ngoài để đóng`
              : "Đang phát âm thanh hướng dẫn..."}
          </div>

          {isAudioFinished && (
            <div className={styles.mobileActions}>
              <button
                type="button"
                className={styles.mobileOkButton}
                onClick={onClose}
              >
                OK
              </button>
            </div>
          )}

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
