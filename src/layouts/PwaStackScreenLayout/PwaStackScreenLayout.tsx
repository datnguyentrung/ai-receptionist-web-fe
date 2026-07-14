import { ChevronLeft, ScanFace } from "lucide-react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import styles from "./PwaStackScreenLayout.module.scss";

type PwaStackScreenLayoutProps = {
  title: string;
  children: ReactNode;
  onBack?: () => void;
  showBackButton?: boolean;
  showBottomNavigation?: boolean;
  className?: string;
  contentClassName?: string;
  withBottomNavigation?: boolean;
};

export function PwaStackScreenLayout({
  title,
  children,
  onBack,
  showBackButton = true,
  showBottomNavigation = true,
  className = "",
  contentClassName = "",
  withBottomNavigation = false,
}: PwaStackScreenLayoutProps) {
  const navigate = useNavigate();
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
        className={`${styles.content} ${withBottomNavigation ? styles.contentWithBottomNavigation : ""
          } ${contentClassName}`}
      >
        {children}
      </main>
      {showBottomNavigation ? <BottomNavigationBar /> : null}
    </section>
  );
}
