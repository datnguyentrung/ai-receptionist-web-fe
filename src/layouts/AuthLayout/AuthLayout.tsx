import { LeftPanel } from "@/components/LeftPanel";
import styles from "./AuthLayout.module.scss";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.card}>
        <div className={styles.cardContent}>
          {/* Cột trái: LUÔN LUÔN CỐ ĐỊNH CHO MỌI TRANG AUTH */}
          <LeftPanel />

          {/* Cột phải: LỖ HỔNG ĐỂ NHÉT COMPONENT VÀO */}
          <div className={styles.rightPanel}>{children}</div>
        </div>
      </div>
    </div>
  );
};
