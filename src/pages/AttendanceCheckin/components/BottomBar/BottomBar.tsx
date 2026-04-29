import { Info } from "lucide-react";
import { memo } from "react";
import styles from "./BottomBar.module.scss";

interface BottomBarProps {
  unmarkedCount: number;
  evalCount: number;
}

function BottomBarInner({ unmarkedCount, evalCount }: BottomBarProps) {
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
