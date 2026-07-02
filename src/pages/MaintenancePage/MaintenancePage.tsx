import { CalendarClock, RefreshCw, ShieldCheck } from "lucide-react";
import styles from "./MaintenancePage.module.scss";

export function MaintenancePage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell} aria-labelledby="maintenance-title">
        <div className={styles.statusRail} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className={styles.content}>
          <div className={styles.badge}>
            <RefreshCw size={18} strokeWidth={1.8} />
            <span>Hệ thống đang cập nhật</span>
          </div>

          <h1 id="maintenance-title">Đang bảo trì và cập nhật</h1>

          <p>
            Chúng tôi đang nâng cấp hệ thống để cải thiện tốc độ, độ ổn định và
            trải nghiệm sử dụng. Vui lòng quay lại sau ít phút.
          </p>

          <div className={styles.details} aria-label="Thông tin bảo trì">
            <div>
              <ShieldCheck size={22} strokeWidth={1.7} />
              <span>Dữ liệu của bạn vẫn được bảo vệ an toàn.</span>
            </div>
            <div>
              <CalendarClock size={22} strokeWidth={1.7} />
              <span>Dịch vụ sẽ hoạt động lại ngay khi cập nhật hoàn tất.</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
