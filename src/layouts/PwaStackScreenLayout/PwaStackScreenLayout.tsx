import { PullToRefresh } from "@/app/providers/pull-to-refresh";
import { isPWA } from "@/config/appMode";
import { ChevronLeft, ScanFace } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./PwaStackScreenLayout.module.scss";

type PwaStackScreenLayoutProps = {
  title: string;
  children: ReactNode;
  onBack?: () => void;
  className?: string;
  contentClassName?: string;
  withBottomNavigation?: boolean;
  showBackButton?: boolean;
};

export function PwaStackScreenLayout({
  title,
  children,
  onBack,
  className = "",
  contentClassName = "",
  withBottomNavigation = false,
  showBackButton = true,
}: PwaStackScreenLayoutProps) {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLElement | null>(null);
  const { pathname } = useLocation();
  const normalizedPathname = pathname.replace(/\/$/, "");
  const showScanAction = /^\/schedules(?:\/|$)/.test(normalizedPathname);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <section
      className={`${styles.screen} ${className}`}
      data-layout="pwa-stack-screen"
    >
      <header className={styles.header}>
        <div className={styles.headerArt} aria-hidden="true" />
        <div className={styles.headerInner}>
          {showBackButton ? (
            <button
              type="button"
              className={styles.backButton}
              aria-label="Quay lại"
              onClick={handleBack}
            >
              <ChevronLeft size={28} strokeWidth={2.4} />
            </button>
          ) : (
            <div className={styles.headerSpacer} aria-hidden="true" />
          )}
          <h1 className={styles.title}>{title}</h1>
          {showScanAction ? (
            <button
              type="button"
              className={styles.headerActionButton}
              aria-label="Mở AI check-in"
              onClick={() => navigate("/check-in")}
            >
              <ScanFace size={21} strokeWidth={2.25} />
            </button>
          ) : (
            <div className={styles.headerSpacer} aria-hidden="true" />
          )}
        </div>
      </header>

      <main
        ref={contentRef}
        className={`${styles.content} ${withBottomNavigation ? styles.contentWithBottomNavigation : ""
          } ${contentClassName}`}
      >
        <PullToRefresh enabled={isPWA} scrollContainerRef={contentRef}>
          {children}
        </PullToRefresh>
      </main>
    </section>
  );
}
