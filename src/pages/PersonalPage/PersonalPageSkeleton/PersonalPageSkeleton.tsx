import styles from "./PersonalPageSkeleton.module.scss";

export default function PersonalPageSkeleton({
  variant = "page",
}: {
  variant?: "page" | "tab";
}) {
  if (variant === "tab") {
    return (
      <div className={styles.tabSkeleton} aria-hidden>
        <div className={styles.tabHeader}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={styles.tabPill} />
          ))}
        </div>

        <div className={styles.tabContent}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.row} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageSkeleton} aria-hidden>
      <div className={styles.cover} />

      <div className={styles.headerRow}>
        <div className={styles.avatar} />
        <div className={styles.headerLines}>
          <div className={styles.lineLarge} />
          <div className={styles.lineMedium} />
        </div>
      </div>

      <div className={styles.tabs}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.tab} />
        ))}
      </div>

      <div className={styles.content}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.card} />
        ))}
      </div>
    </div>
  );
}
