import { isPWA } from "@/config/appMode";
import { CheckCircle2, Info, X } from "lucide-react";
import { memo, useMemo, useState, type CSSProperties } from "react";
import styles from "./BottomBar.module.scss";

interface BottomBarProps {
  unmarkedCount: number;
  evalCount: number;
}

function BottomBarInner({ unmarkedCount, evalCount }: BottomBarProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const completedCount = Math.max(evalCount - unmarkedCount, 0);
  const progress = useMemo(() => {
    if (evalCount <= 0) return 0;
    return Math.min(100, Math.round((completedCount / evalCount) * 100));
  }, [completedCount, evalCount]);

  if (isPWA) {
    return (
      <>
        <div className={styles.mobileDock} role="status" aria-live="polite">
          <button
            type="button"
            className={`${styles.mobileDockButton} ${
              unmarkedCount > 0 ? styles.needsAttention : styles.complete
            }`}
            onClick={() => setDetailsOpen(true)}
            aria-expanded={detailsOpen}
            aria-controls="attendance-progress-sheet"
            aria-label={`Mở tiến trình đánh giá: ${completedCount}/${evalCount}, còn ${unmarkedCount}`}
          >
            <span
              className={styles.mobileProgressRing}
              style={{ "--progress": `${progress}%` } as CSSProperties}
              aria-hidden="true"
            >
              <span className={styles.mobileIcon}>
                {unmarkedCount > 0 ? (
                  <Info size={22} />
                ) : (
                  <CheckCircle2 size={22} />
                )}
              </span>
            </span>
            {unmarkedCount > 0 && (
              <span className={styles.mobileBadge}>{unmarkedCount}</span>
            )}
          </button>
        </div>

        {detailsOpen && (
          <div className={styles.sheetLayer}>
            <button
              type="button"
              className={styles.sheetScrim}
              aria-label="Đóng tiến trình đánh giá"
              onClick={() => setDetailsOpen(false)}
            />
            <section
              id="attendance-progress-sheet"
              className={styles.progressSheet}
              aria-label="Chi tiết tiến trình đánh giá"
            >
              <div className={styles.sheetHandle} />
              <div className={styles.sheetHeader}>
                <div>
                  <p className={styles.sheetKicker}>Tiến trình đánh giá</p>
                  <h2 className={styles.sheetTitle}>
                    {completedCount}/{evalCount} học viên
                  </h2>
                </div>
                <button
                  type="button"
                  className={styles.sheetClose}
                  aria-label="Đóng"
                  onClick={() => setDetailsOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className={styles.sheetProgressTrack}>
                <div
                  className={styles.sheetProgressBar}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className={styles.sheetStats}>
                <div className={styles.sheetStat}>
                  <span>{completedCount}</span>
                  <p>Đã đánh giá</p>
                </div>
                <div className={styles.sheetStat}>
                  <span>{unmarkedCount}</span>
                  <p>Còn lại</p>
                </div>
                <div className={styles.sheetStat}>
                  <span>{progress}%</span>
                  <p>Hoàn tất</p>
                </div>
              </div>
              {unmarkedCount > 0 ? (
                <p className={styles.sheetWarning}>
                  Còn {unmarkedCount} học viên chưa được đánh giá.
                </p>
              ) : (
                <p className={styles.sheetSuccess}>
                  Tất cả học viên đã có đánh giá.
                </p>
              )}
            </section>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={styles.bottomBar}>
      {unmarkedCount > 0 && (
        <div className={styles.warningBanner}>
          <Info size={14} style={{ color: "#D97706", flexShrink: 0 }} />
          <p className={styles.warningText}>
            Còn <span className={styles.warningCount}>{unmarkedCount}</span> học
            viên chưa được đánh giá
          </p>
        </div>
      )}

      <div className={styles.btnSubmit} role="status" aria-live="polite">
        <Info size={18} /> Tiến trình đánh giá ({unmarkedCount}/{evalCount})
      </div>
    </div>
  );
}

export const BottomBar = memo(BottomBarInner);
