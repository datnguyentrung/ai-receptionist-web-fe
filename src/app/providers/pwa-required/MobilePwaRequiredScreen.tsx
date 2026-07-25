import { Button } from "@/components/ui/button";
import { Download, EllipsisVertical, MoreVertical, Share2, Smartphone } from "lucide-react";
import { useAppEnvironment } from "./AppEnvironmentProvider";
import styles from "./MobilePwaRequiredScreen.module.scss";

function AndroidInstructions() {
  return (
    <ol className={styles.instructions}>
      <li>Mở menu trình duyệt, thường là biểu tượng ba chấm.</li>
      <li>
        Chọn “Cài đặt và tạo lối tắt”, “Install app” hoặc “Thêm vào màn hình chính”.
      </li>
      <li>Xác nhận cài đặt, rồi mở ứng dụng từ biểu tượng trên màn hình chính.</li>
    </ol>
  );
}

function IosInstructions({ isSafari }: { isSafari: boolean }) {
  if (!isSafari) {
    return (
      <p className={styles.browserNotice}>
        Hãy mở đường dẫn này bằng Safari để thêm ứng dụng vào Màn hình chính.
      </p>
    );
  }

  return (
    <ol className={styles.instructions}>
      <li>
        Nhấn biểu tượng Tính năng <EllipsisVertical aria-hidden="true" size={18}/> trong Safari.
      </li>
      <li>
        Chọn biểu tượng Chia sẻ <Share2 aria-hidden="true" size={18} /> và chọn "Xem thêm"
      </li>
      <li>Chọn “Thêm vào Màn hình chính” hoặc “Add to Home Screen”.</li>
      <li>Nhấn “Thêm”, rồi mở ứng dụng từ biểu tượng vừa tạo.</li>
    </ol>
  );
}

export function MobilePwaRequiredScreen() {
  const { appEnvironment, installState, requestInstall } = useAppEnvironment();
  const { isAndroid, isIOS, isSafari } = appEnvironment;
  const canUseNativeInstallPrompt =
    isAndroid && installState === "available";
  const showManualAndroidInstructions =
    isAndroid && !canUseNativeInstallPrompt && installState !== "installed";

  return (
    <main className={styles.page} aria-labelledby="pwa-required-title">
      <section className={styles.card}>
        <div className={styles.iconWrap} aria-hidden="true">
          <Smartphone size={34} strokeWidth={1.8} />
        </div>

        <p className={styles.eyebrow}>ỨNG DỤNG DI ĐỘNG</p>
        <h1 id="pwa-required-title">Cài đặt ứng dụng để tiếp tục</h1>
        <p className={styles.description}>
          Để có trải nghiệm ổn định và đầy đủ tính năng, vui lòng cài đặt ứng
          dụng trên điện thoại và mở ứng dụng từ màn hình chính. Phiên bản web
          trên trình duyệt chỉ hỗ trợ máy tính.
        </p>

        <div className={styles.guide}>
          <div className={styles.guideHeader}>
            <MoreVertical aria-hidden="true" size={20} />
            <h2>Hướng dẫn cài đặt</h2>
          </div>

          {installState === "installed" ? (
            <p className={styles.successNotice} role="status">
              Ứng dụng đã được cài đặt. Hãy quay về màn hình chính và mở từ biểu
              tượng ứng dụng để tiếp tục.
            </p>
          ) : null}

          {canUseNativeInstallPrompt ? (
            <Button
              type="button"
              size="lg"
              className={styles.installButton}
              onClick={() => void requestInstall()}
            >
              <Download aria-hidden="true" size={20} />
              Cài đặt ứng dụng
            </Button>
          ) : null}

          {installState === "prompting" ? (
            <p className={styles.statusMessage} role="status">
              Đang mở trình cài đặt…
            </p>
          ) : null}

          {installState === "accepted" ? (
            <p className={styles.successNotice} role="status">
              Đã xác nhận cài đặt. Khi hoàn tất, hãy mở ứng dụng từ biểu tượng
              trên màn hình chính.
            </p>
          ) : null}

          {installState === "error" ? (
            <p className={styles.statusMessage} role="status">
              Không thể mở trình cài đặt. Vui lòng thực hiện theo các bước thủ
              công bên dưới.
            </p>
          ) : null}

          {showManualAndroidInstructions ? <AndroidInstructions /> : null}
          {isIOS ? <IosInstructions isSafari={isSafari} /> : null}
          {!isAndroid && !isIOS ? <AndroidInstructions /> : null}
        </div>
      </section>
    </main>
  );
}
