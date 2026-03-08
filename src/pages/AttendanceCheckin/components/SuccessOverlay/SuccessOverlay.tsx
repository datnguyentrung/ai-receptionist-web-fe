import { Check } from "lucide-react";
import { motion } from "motion/react";
import styles from "./SuccessOverlay.module.scss";

interface SuccessOverlayProps {
  onClose: () => void;
  present: number;
  absent: number;
  excused: number;
  className: string;
  submittedTime: string;
}

export function SuccessOverlay({
  onClose,
  present,
  absent,
  excused,
  className,
  submittedTime,
}: SuccessOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={styles.successOverlay}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={styles.successCard}
      >
        <div className={styles.successIcon}>
          <Check size={36} style={{ color: "white" }} strokeWidth={3} />
        </div>
        <p className={styles.successTitle}>Điểm danh thành công!</p>
        <p className={styles.successSubtitle}>
          Buổi học{" "}
          <span className={styles.successClassName}>{className}</span>
          <br />
          đã được lưu lúc {submittedTime}
        </p>
        <div className={styles.successStats}>
          {[
            { label: "Có mặt", val: present, color: "#16A34A", bg: "#F0FDF4" },
            { label: "Vắng", val: absent, color: "#E02020", bg: "#FFF1F2" },
            { label: "Có phép", val: excused, color: "#D97706", bg: "#FFFBEB" },
          ].map((c) => (
            <div
              key={c.label}
              className={styles.successStatItem}
              style={{ background: c.bg }}
            >
              <p className={styles.successStatValue} style={{ color: c.color }}>
                {c.val}
              </p>
              <p className={styles.successStatLabel}>{c.label}</p>
            </div>
          ))}
        </div>
        <button onClick={onClose} className={styles.btnDone}>
          Xong
        </button>
      </motion.div>
    </motion.div>
  );
}
