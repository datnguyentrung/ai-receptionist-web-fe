import logoImg from "@assets/taekwondo.jpg";
import { ChevronRight, Sparkles, Star, Trophy } from "lucide-react";
import { motion } from "motion/react";
import styles from "./IdlePromoCard.module.scss";

export function IdlePromoCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
      className={styles.card}
    >
      {/* Top decorative strip */}
      <div className={styles.topStrip} />

      <div className={styles.body}>
        <motion.img
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          src={logoImg}
          alt="Taekwondo Văn Quán Logo"
          className={styles.logo}
        />

        <div className={styles.heading}>
          <h2>Chào mừng đến với võ đường</h2>
          <p>Hệ thống Taekwondo Văn Quán</p>
        </div>

        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <Star size={22} />
            </div>
            <div className={styles.featureContent}>
              <h3>Lớp võ phong trào</h3>
              <p>Tuyển sinh học viên mới hàng tháng</p>
            </div>
            <ChevronRight size={18} className={styles.featureChevron} />
          </div>

          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <Trophy size={22} />
            </div>
            <div className={styles.featureContent}>
              <h3>Đội tuyển thi đấu</h3>
              <p>Đào tạo tài năng trẻ xuất sắc</p>
            </div>
            <ChevronRight size={18} className={styles.featureChevron} />
          </div>
        </div>

        <div className={styles.footer}>
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={styles.prompt}
          >
            <span className={styles.promptIcon}>
              <Sparkles size={22} />
            </span>
            <p className={styles.promptText}>
              Vui lòng nhìn vào camera
              <br />
              để điểm danh
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
