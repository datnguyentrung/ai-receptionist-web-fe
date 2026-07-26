import logo from "/taekwondo.jpg";
import type { CheckInResponse } from "@/types";
import { CheckCircle, Clock, MapPin, UserCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import styles from "./CheckInCard.module.scss";

type CheckInCardProps = {
  user: CheckInResponse | null;
  onConfirm: () => void;
};

/** A persistent confirmation dialog for a completed face check-in. */
export function CheckInCard({ user, onConfirm }: CheckInCardProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (user) {
      confirmButtonRef.current?.focus();
    }
  }, [user]);

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

  return (
    <AnimatePresence>
      <motion.div
        key="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className={styles.overlay}
      >
        <motion.div
          key="modal-card"
          initial={{ opacity: 0, scale: 0.88, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 40 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.35 }}
          className={styles.card}
          role="dialog"
          aria-modal="true"
          aria-labelledby="check-in-result-title"
        >
          <div className={styles.topStrip} />

          <div className={styles.body}>
            <div className={styles.aiMessageWrapper}>
              <motion.h1
                id="check-in-result-title"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className={styles.aiMessage}
              >
                {user?.message || "Đã ghi nhận check-in thành công."}
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
                  <h2 className={styles.studentName}>{displayName}</h2>
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
                <p className={styles.infoCardAccentNote}>{sessionDate ?? "Hôm nay"}</p>
              </motion.div>
            </div>
          </div>

          <div className={styles.dismissHint}>
            Xác nhận để tiếp tục quét người tiếp theo.
          </div>

          <div className={styles.mobileActions}>
            <button
              ref={confirmButtonRef}
              type="button"
              className={styles.mobileOkButton}
              onClick={onConfirm}
            >
              OK, quét người tiếp theo
            </button>
          </div>

          <div className={styles.decorDots} aria-hidden="true">
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
