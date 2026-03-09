import { CheckCircle, Clock, MapPin, UserCircle } from "lucide-react";
import { motion } from "motion/react";
import styles from "./CheckInCard.module.scss";

export function CheckInCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      className={styles.card}
    >
      {/* Decorative top strip */}
      <div className={styles.topStrip} />

      <div className={styles.body}>
        {/* Success Header */}
        <div className={styles.header}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
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
              transition={{ delay: 0.4 }}
              src="https://images.unsplash.com/photo-1613611864136-0ace2a3b9926?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWVrd29uZG8lMjBzdHVkZW50JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczMDg4MDM2fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Student"
              className={styles.avatar}
            />
            <div className={styles.verifiedBadge}>
              <CheckCircle size={12} strokeWidth={3} />
            </div>
          </div>
          <div>
            <h2 className={styles.studentName}>Julian Kim</h2>
            <div className={styles.beltBadge}>
              <span className={styles.beltDot} />
              Red Belt
            </div>
            <p className={styles.memberId}>
              <UserCircle size={16} />
              Member #8492
            </p>
          </div>
        </div>

        {/* Schedule Info */}
        <div className={styles.scheduleGrid}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className={styles.infoCard}
          >
            <div className={styles.infoCardLabel}>
              <Clock />
              <span>Time</span>
            </div>
            <p className={styles.infoCardTime}>17:55</p>
            <p className={styles.infoCardNote}>On Time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
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
  );
}
