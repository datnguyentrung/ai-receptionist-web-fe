import { Link } from "react-router-dom";
import styles from "./HomePage.module.scss";

export default function HomePage() {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.card}>
        <div>
          <div className={styles.iconWrapper}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h1 className={styles.title}>Chào Mừng Đến Với Hệ Thống</h1>
          <h2 className={styles.subtitle}>Taekwondo Văn Quán</h2>
          <p className={styles.description}>
            Hệ thống quản lý đào tạo và thi đấu Taekwondo chuyên nghiệp. Quản lý
            học viên, huấn luyện viên, lớp học và các hoạt động thi đấu một cách
            hiệu quả.
          </p>
        </div>

        <div className={styles.features}>
          <div className={`${styles.featureCard} ${styles.red}`}>
            <div className={styles.featureIcon}>👥</div>
            <h3 className={styles.featureTitle}>Quản Lý Học Viên</h3>
            <p className={styles.featureDescription}>
              Theo dõi thông tin và tiến độ học tập
            </p>
          </div>
          <div className={`${styles.featureCard} ${styles.blue}`}>
            <div className={styles.featureIcon}>📚</div>
            <h3 className={styles.featureTitle}>Quản Lý Lớp Học</h3>
            <p className={styles.featureDescription}>
              Tổ chức và sắp xếp lịch học hiệu quả
            </p>
          </div>
          <div className={`${styles.featureCard} ${styles.yellow}`}>
            <div className={styles.featureIcon}>🥋</div>
            <h3 className={styles.featureTitle}>Quản Lý Thi Đấu</h3>
            <p className={styles.featureDescription}>
              Theo dõi giải đấu và thành tích
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <Link to="/login" className={styles.buttonPrimary}>
            Đăng Nhập
          </Link>
          <button className={styles.buttonSecondary}>Tìm Hiểu Thêm</button>
        </div>
      </div>
    </div>
  );
}
