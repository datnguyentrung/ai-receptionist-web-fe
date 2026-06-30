import { LoginForm } from "@/components/LoginForm";
import { AuthLayout } from "@/layouts/AuthLayout";
import styles from "./LoginPage.module.scss";

export default function LoginPage() {
  return (
    <AuthLayout>
      {/* Tiêu đề form */}
      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>Đăng Nhập</h1>
        <p className={styles.formSubtitle}>
          Đăng nhập để quản lý hệ thống điểm danh
        </p>
      </div>

      {/* Form đăng nhập */}
      <LoginForm />
    </AuthLayout>
  );
}
