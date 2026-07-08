import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PwaStackScreenLayout.module.scss";

type PwaStackScreenLayoutProps = {
  title: string;
  children: ReactNode;
  onBack?: () => void;
  className?: string;
  contentClassName?: string;
};

export function PwaStackScreenLayout({
  title,
  children,
  onBack,
  className = "",
  contentClassName = "",
}: PwaStackScreenLayoutProps) {
  const navigate = useNavigate();

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
        <button
          type="button"
          className={styles.backButton}
          aria-label="Quay lại"
          onClick={handleBack}
        >
          <ChevronLeft size={28} strokeWidth={2.4} />
        </button>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.headerSpacer} aria-hidden="true" />
      </header>

      <main className={`${styles.content} ${contentClassName}`}>
        {children}
      </main>
    </section>
  );
}
