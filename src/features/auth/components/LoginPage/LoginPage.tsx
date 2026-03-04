import { LoginForm } from "@/components/LoginForm";
import { AuthLayout } from "@/layouts/AuthLayout";
import styles from "./LoginPage.module.scss";

export default function LoginPage() {
  // Không còn một cái useState nào ở đây nữa! Rất sạch sẽ!

  return (
    <AuthLayout>
      {/* 1. Tiêu đề cố định */}
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Đăng Nhập</h2>
        <p className={styles.formSubtitle}>
          Vui lòng nhập thông tin tài khoản của bạn
        </p>
      </div>

      {/* 2. ĐỘNG CƠ XỬ LÝ: Nhét LoginForm vào đây */}
      <LoginForm />

      {/* 3. Phụ kiện phía dưới (Divider và Link đăng ký) */}
      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <span className={styles.dividerText}>hoặc</span>
        <div className={styles.dividerLine} />
      </div>

      <p className={styles.registerSection}>
        Chưa có tài khoản?{" "}
        <a href="#" className={styles.registerLink}>
          Đăng ký ngay
        </a>
      </p>
    </AuthLayout>
  );
}
